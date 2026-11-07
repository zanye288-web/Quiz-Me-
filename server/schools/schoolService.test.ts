import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.SCHOOL_CODE_SECRET = 'test-secret-that-is-long-enough-123';

import { MemorySchoolStore } from './memoryStore';
import { SchoolError, createSchoolService, type Actor } from './schoolService';
import { MailDeliveryError, type MailMessage } from './mailer';
import {
  CODE_TTL_MS,
  MAX_CODE_ATTEMPTS,
  RESEND_COOLDOWN_MS,
  parseEmail,
  schoolDomainProblem,
} from './schoolLogic';

const actor = (uid: string, name = uid): Actor => ({ uid, displayName: name, isAnonymous: false });

async function expectError(promise: Promise<unknown>, code: string, status?: number) {
  await assert.rejects(promise, (err: unknown) => {
    assert.ok(err instanceof SchoolError, `expected SchoolError, got ${String(err)}`);
    assert.equal(err.code, code);
    if (status) assert.equal(err.status, status);
    return true;
  });
}

describe('email + domain rules', () => {
  it('normalizes and parses emails', () => {
    const e = parseEmail('  Ada.Obi+quiz@Greenfield.edu.ng ');
    assert.ok(e);
    assert.equal(e.address, 'ada.obi+quiz@greenfield.edu.ng');
    assert.equal(e.canonical, 'ada.obi@greenfield.edu.ng');
    assert.equal(e.domain, 'greenfield.edu.ng');
  });

  it('rejects malformed emails', () => {
    for (const bad of ['', 'no-at-sign', 'a@b', 'a@@b.com', '@school.edu', 'a b@school.edu', 'a..b@school.edu', 42, null]) {
      assert.equal(parseEmail(bad as unknown), null, String(bad));
    }
  });

  it('refuses personal-email and shared-suffix domains as schools', () => {
    assert.ok(schoolDomainProblem('gmail.com'));
    assert.ok(schoolDomainProblem('yahoo.com'));
    assert.ok(schoolDomainProblem('edu.ng'));
    assert.equal(schoolDomainProblem('greenfield.edu.ng'), null);
  });
});

describe('school service', () => {
  let store: MemorySchoolStore;
  let clock: number;
  let outbox: MailMessage[];
  let failMail: boolean;
  let svc: ReturnType<typeof createSchoolService>;

  const lastCode = () => {
    const m = outbox[outbox.length - 1]?.text.match(/code is (\d{6})/);
    assert.ok(m, 'expected a code in the last email');
    return m[1];
  };
  const wrongCode = () => (lastCode() === '000000' ? '111111' : '000000');

  beforeEach(() => {
    store = new MemorySchoolStore();
    clock = 1_700_000_000_000;
    outbox = [];
    failMail = false;
    svc = createSchoolService({
      store,
      now: () => clock,
      mailer: async (msg) => {
        if (failMail) throw new MailDeliveryError();
        outbox.push(msg);
      },
    });
  });

  const advance = (ms: number) => {
    clock += ms;
  };

  async function registerSchool(uid = 'admin1', email = 'principal@greenfield.edu.ng') {
    await svc.startRegistration(actor(uid), { schoolName: 'Greenfield College', email });
    return svc.verifyCode(actor(uid), { code: lastCode() });
  }

  it('registers a school after the admin proves they own a mailbox on its domain', async () => {
    const view = await registerSchool();
    assert.equal(view.role, 'admin');
    assert.equal(view.school.id, 'greenfield.edu.ng');
    assert.equal(view.school.name, 'Greenfield College');
    assert.equal(outbox[0].to, 'principal@greenfield.edu.ng');
  });

  it('never stores the code in plain text', async () => {
    await svc.startRegistration(actor('admin1'), { schoolName: 'Greenfield', email: 'p@greenfield.edu.ng' });
    const code = lastCode();
    const stored = JSON.stringify(store.challenges.get('admin1'));
    assert.ok(!stored.includes(code));
  });

  it('does not create the school until the correct code is entered', async () => {
    await svc.startRegistration(actor('admin1'), { schoolName: 'Greenfield', email: 'p@greenfield.edu.ng' });
    assert.equal(store.schools.size, 0);
    await expectError(svc.verifyCode(actor('admin1'), { code: wrongCode() }), 'wrong_code', 400);
    assert.equal(store.schools.size, 0);
  });

  it('lets students join with a school email and groups them under one school', async () => {
    await registerSchool();
    advance(1000);
    await svc.startJoin(actor('stu1', 'Ada'), { email: 'ada@greenfield.edu.ng' });
    const view = await svc.verifyCode(actor('stu1', 'Ada'), { code: lastCode() });
    assert.equal(view.role, 'member');
    assert.equal(view.school.id, 'greenfield.edu.ng');

    const roster = await svc.listRoster(actor('admin1'));
    assert.deepEqual(roster.members.map((m) => m.uid).sort(), ['admin1', 'stu1']);
  });

  it('refuses guests, personal emails, and unregistered schools', async () => {
    await expectError(
      svc.startJoin({ uid: 'g', displayName: 'Guest', isAnonymous: true }, { email: 'a@greenfield.edu.ng' }),
      'guest_not_allowed',
      403
    );
    await expectError(svc.startJoin(actor('u1'), { email: 'me@gmail.com' }), 'personal_email', 400);
    await expectError(svc.startJoin(actor('u1'), { email: 'me@unknown-school.org' }), 'school_not_registered', 404);
    await expectError(
      svc.startRegistration(actor('u1'), { schoolName: 'Fake', email: 'me@gmail.com' }),
      'invalid_school_domain',
      400
    );
    assert.equal(outbox.length, 0, 'no email should be sent for rejected requests');
  });

  it('will not register the same school domain twice', async () => {
    await registerSchool();
    advance(1000);
    await expectError(
      svc.startRegistration(actor('other'), { schoolName: 'Impostor', email: 'x@greenfield.edu.ng' }),
      'school_exists',
      409
    );
  });

  it('rejects an expired code', async () => {
    await svc.startRegistration(actor('admin1'), { schoolName: 'Greenfield', email: 'p@greenfield.edu.ng' });
    const code = lastCode();
    advance(CODE_TTL_MS + 1);
    await expectError(svc.verifyCode(actor('admin1'), { code }), 'code_expired', 400);
    // and it cannot be revived
    await expectError(svc.verifyCode(actor('admin1'), { code }), 'no_pending_code', 400);
  });

  it('cannot replay a code that was already used', async () => {
    await registerSchool();
    const code = lastCode();
    await expectError(svc.verifyCode(actor('admin1'), { code }), 'no_pending_code', 400);
  });

  it('locks out after too many wrong guesses, even if the right code is then entered', async () => {
    await svc.startRegistration(actor('admin1'), { schoolName: 'Greenfield', email: 'p@greenfield.edu.ng' });
    const good = lastCode();
    const bad = wrongCode();

    for (let i = 0; i < MAX_CODE_ATTEMPTS - 1; i++) {
      await expectError(svc.verifyCode(actor('admin1'), { code: bad }), 'wrong_code', 400);
    }
    await expectError(svc.verifyCode(actor('admin1'), { code: bad }), 'locked', 429);
    await expectError(svc.verifyCode(actor('admin1'), { code: good }), 'locked', 429);
    assert.equal(store.schools.size, 0);

    // and requesting a fresh code while locked is refused too
    advance(RESEND_COOLDOWN_MS + 1);
    await expectError(
      svc.startRegistration(actor('admin1'), { schoolName: 'Greenfield', email: 'p@greenfield.edu.ng' }),
      'locked',
      429
    );
  });

  it('parallel guesses cannot exceed the attempt limit', async () => {
    await svc.startRegistration(actor('admin1'), { schoolName: 'Greenfield', email: 'p@greenfield.edu.ng' });
    const good = lastCode();
    const bad = wrongCode();

    await Promise.allSettled(Array.from({ length: 25 }, () => svc.verifyCode(actor('admin1'), { code: bad })));
    await expectError(svc.verifyCode(actor('admin1'), { code: good }), 'locked', 429);
  });

  it('enforces a resend cooldown, then allows a new code (which invalidates the old one)', async () => {
    await svc.startRegistration(actor('admin1'), { schoolName: 'Greenfield', email: 'p@greenfield.edu.ng' });
    const first = lastCode();
    await expectError(
      svc.startRegistration(actor('admin1'), { schoolName: 'Greenfield', email: 'p@greenfield.edu.ng' }),
      'cooldown',
      429
    );
    advance(RESEND_COOLDOWN_MS + 1);
    await svc.startRegistration(actor('admin1'), { schoolName: 'Greenfield', email: 'p@greenfield.edu.ng' });
    const second = lastCode();
    if (first !== second) {
      await expectError(svc.verifyCode(actor('admin1'), { code: first }), 'wrong_code', 400);
    }
    const view = await svc.verifyCode(actor('admin1'), { code: second });
    assert.equal(view.role, 'admin');
  });

  it('caps how many codes one account can request per hour', async () => {
    for (let i = 0; i < 5; i++) {
      await svc.startRegistration(actor('admin1'), { schoolName: 'Greenfield', email: `p${i}@greenfield.edu.ng` });
      advance(RESEND_COOLDOWN_MS + 1);
    }
    await expectError(
      svc.startRegistration(actor('admin1'), { schoolName: 'Greenfield', email: 'p9@greenfield.edu.ng' }),
      'too_many_codes',
      429
    );
  });

  it('caps how many codes can be sent to one inbox (anti mail-bombing across accounts)', async () => {
    await registerSchool();
    advance(1000);
    for (let i = 0; i < 5; i++) {
      await svc.startJoin(actor(`attacker${i}`), { email: 'victim@greenfield.edu.ng' });
    }
    await expectError(svc.startJoin(actor('attacker5'), { email: 'victim@greenfield.edu.ng' }), 'too_many_codes', 429);
    // "+tag" tricks count against the same inbox
    await expectError(svc.startJoin(actor('attacker6'), { email: 'victim+x@greenfield.edu.ng' }), 'too_many_codes', 429);
  });

  it('one school email can only be linked to one account', async () => {
    await registerSchool();
    advance(1000);
    await svc.startJoin(actor('stu1'), { email: 'ada@greenfield.edu.ng' });
    await svc.verifyCode(actor('stu1'), { code: lastCode() });

    await svc.startJoin(actor('stu2'), { email: 'ada+alt@greenfield.edu.ng' });
    await expectError(svc.verifyCode(actor('stu2'), { code: lastCode() }), 'email_taken', 409);
    assert.equal(await store.getMember('stu2'), null);
  });

  it('removes the pending code when the email cannot be delivered', async () => {
    failMail = true;
    await expectError(
      svc.startRegistration(actor('admin1'), { schoolName: 'Greenfield', email: 'p@greenfield.edu.ng' }),
      'email_failed',
      502
    );
    assert.equal(store.challenges.size, 0);
  });

  it('only the school admin can see the roster or remove members', async () => {
    await registerSchool();
    advance(1000);
    await svc.startJoin(actor('stu1'), { email: 'ada@greenfield.edu.ng' });
    await svc.verifyCode(actor('stu1'), { code: lastCode() });

    await expectError(svc.listRoster(actor('stu1')), 'not_school_admin', 403);
    await expectError(svc.removeMember(actor('stu1'), 'admin1'), 'not_school_admin', 403);
    await expectError(svc.removeMember(actor('admin1'), 'admin1'), 'cannot_remove_admin', 409);
    await expectError(svc.removeMember(actor('admin1'), 'nobody'), 'member_not_found', 404);

    await svc.removeMember(actor('admin1'), 'stu1');
    assert.equal(await svc.getMembership(actor('stu1')), null);
    // the freed email can be used again
    assert.equal(store.emails.size, 1);
  });

  it('members can leave; the admin cannot', async () => {
    await registerSchool();
    advance(1000);
    await svc.startJoin(actor('stu1'), { email: 'ada@greenfield.edu.ng' });
    await svc.verifyCode(actor('stu1'), { code: lastCode() });

    await svc.leave(actor('stu1'));
    assert.equal(await svc.getMembership(actor('stu1')), null);
    await expectError(svc.leave(actor('admin1')), 'admin_cannot_leave', 409);
    await expectError(svc.leave(actor('stu1')), 'not_a_member', 404);
  });

  it('rejects malformed codes without burning an attempt', async () => {
    await svc.startRegistration(actor('admin1'), { schoolName: 'Greenfield', email: 'p@greenfield.edu.ng' });
    await expectError(svc.verifyCode(actor('admin1'), { code: '12ab56' }), 'invalid_code', 400);
    await expectError(svc.verifyCode(actor('admin1'), { code: '123' }), 'invalid_code', 400);
    assert.equal(store.challenges.get('admin1')?.attempts, 0);
  });
});
