import React, { useCallback, useEffect, useState } from 'react';
import { Building2, CheckCircle2, AlertCircle, Loader2, Mail, KeyRound, Users, LogOut, Trash2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  SchoolApiError,
  fetchMembership,
  fetchSchoolRoster,
  leaveSchool,
  removeSchoolMember,
  startSchoolJoin,
  startSchoolRegistration,
  verifySchoolCode,
  type CodeSent,
  type RosterEntry,
  type SchoolMembership,
} from '../services/schools';

type Step = 'choose' | 'email' | 'code';
type Flow = 'join' | 'register';

const inputClass =
  'w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500';
const primaryBtn =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-5 py-3 text-sm transition-colors cursor-pointer';
const secondaryBtn =
  'inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold px-4 py-2.5 text-sm transition-colors cursor-pointer disabled:opacity-50';

export const SchoolHubView: React.FC = () => {
  const { user } = useAuth();
  const isGuest = !user || (user as { isAnonymous?: boolean }).isAnonymous === true;

  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState<SchoolMembership | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [step, setStep] = useState<Step>('choose');
  const [flow, setFlow] = useState<Flow>('join');
  const [schoolName, setSchoolName] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState<CodeSent | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const [roster, setRoster] = useState<RosterEntry[] | null>(null);
  const [rosterError, setRosterError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (isGuest) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      setMembership(await fetchMembership());
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Could not load your school.');
    } finally {
      setLoading(false);
    }
  }, [isGuest]);

  useEffect(() => {
    void load();
  }, [load]);

  // Resend countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const loadRoster = useCallback(async () => {
    setRosterError(null);
    try {
      const r = await fetchSchoolRoster();
      setRoster(r.members);
    } catch (e) {
      setRosterError(e instanceof Error ? e.message : 'Could not load members.');
    }
  }, []);

  useEffect(() => {
    if (membership?.role === 'admin') void loadRoster();
    else setRoster(null);
  }, [membership, loadRoster]);

  const describe = (e: unknown): string => {
    if (e instanceof SchoolApiError) {
      if (e.retryAfter && e.retryAfter < 120) return `${e.message} (try again in ${e.retryAfter}s)`;
      return e.message;
    }
    return 'Something went wrong. Please try again.';
  };

  const sendCode = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = flow === 'register' ? await startSchoolRegistration(schoolName, email) : await startSchoolJoin(email);
      setSent(r);
      setCooldown(r.resendAfterSeconds);
      setCode('');
      setStep('code');
    } catch (e) {
      setError(describe(e));
      if (e instanceof SchoolApiError && e.code === 'cooldown') setCooldown(60);
    } finally {
      setBusy(false);
    }
  };

  const submitCode = async () => {
    setBusy(true);
    setError(null);
    try {
      const m = await verifySchoolCode(code);
      setMembership(m);
      setStep('choose');
      setEmail('');
      setCode('');
      setSchoolName('');
      setSent(null);
    } catch (e) {
      setError(describe(e));
      if (e instanceof SchoolApiError && ['code_expired', 'no_pending_code', 'locked'].includes(e.code)) {
        setCode('');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Leave your school? You can rejoin later with a new verification code.')) return;
    setBusy(true);
    try {
      await leaveSchool();
      setMembership(null);
    } catch (e) {
      setError(describe(e));
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (m: RosterEntry) => {
    if (!window.confirm(`Remove ${m.displayName} (${m.email}) from the school?`)) return;
    try {
      await removeSchoolMember(m.uid);
      setRoster((r) => (r ? r.filter((x) => x.uid !== m.uid) : r));
    } catch (e) {
      setRosterError(describe(e));
    }
  };

  const shell = (children: React.ReactNode) => (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">My School</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Learn together as one school, verified with your school email.
          </p>
        </div>
      </div>
      {children}
    </div>
  );

  const card = 'rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 sm:p-6';

  if (isGuest) {
    return shell(
      <div className={card}>
        <div className="flex items-start gap-3 text-slate-800 dark:text-slate-100">
          <ShieldCheck className="w-5 h-5 mt-0.5 text-indigo-500 shrink-0" />
          <p className="text-sm">
            School accounts need a full account so your school email can be verified. Sign out of guest mode and sign in or
            create an account to continue.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return shell(
      <div className={`${card} flex items-center gap-3 text-slate-700 dark:text-slate-200`}>
        <Loader2 className="w-5 h-5 animate-spin" /> Loading your school…
      </div>
    );
  }

  if (loadError) {
    return shell(
      <div className={card}>
        <p className="text-sm text-red-600 dark:text-red-400 mb-3">{loadError}</p>
        <button className={secondaryBtn} onClick={() => void load()}>
          Try again
        </button>
      </div>
    );
  }

  if (membership) {
    return shell(
      <div className="space-y-5">
        <div className={card}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                <CheckCircle2 className="w-4 h-4" /> Verified member
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{membership.school.name}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                {membership.email} · {membership.role === 'admin' ? 'School admin' : 'Member'}
              </p>
            </div>
            {membership.role !== 'admin' && (
              <button className={secondaryBtn} onClick={() => void handleLeave()} disabled={busy}>
                <LogOut className="w-4 h-4" /> Leave school
              </button>
            )}
          </div>
          {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>

        {membership.role === 'admin' && (
          <div className={card}>
            <div className="flex items-center gap-2 mb-3 text-slate-900 dark:text-white font-bold">
              <Users className="w-5 h-5" /> Members {roster ? `(${roster.length})` : ''}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Anyone with a verified <strong>@{membership.school.domain}</strong> email can join. Share this page’s steps with
              your students and teachers.
            </p>
            {rosterError && <p className="text-sm text-red-600 dark:text-red-400 mb-2">{rosterError}</p>}
            {!roster && !rosterError && (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading members…
              </div>
            )}
            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
              {roster?.map((m) => (
                <li key={m.uid} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {m.displayName} {m.role === 'admin' && <span className="text-xs text-indigo-500">(admin)</span>}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 truncate">{m.email}</div>
                  </div>
                  {m.role !== 'admin' && (
                    <button
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                      title="Remove member"
                      aria-label={`Remove ${m.displayName}`}
                      onClick={() => void handleRemove(m)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // ----- Not in a school yet -----
  if (step === 'choose') {
    return shell(
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          className={`${card} text-left hover:border-indigo-500 transition-colors cursor-pointer`}
          onClick={() => {
            setFlow('join');
            setError(null);
            setStep('email');
          }}
        >
          <Mail className="w-6 h-6 text-indigo-500 mb-3" />
          <div className="font-black text-slate-900 dark:text-white mb-1">Join your school</div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Use your school email (like name@yourschool.edu). We’ll send a code to confirm it’s yours.
          </p>
        </button>
        <button
          className={`${card} text-left hover:border-indigo-500 transition-colors cursor-pointer`}
          onClick={() => {
            setFlow('register');
            setError(null);
            setStep('email');
          }}
        >
          <Building2 className="w-6 h-6 text-indigo-500 mb-3" />
          <div className="font-black text-slate-900 dark:text-white mb-1">Register a school</div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Teachers and administrators: set up your school so everyone with a school email can join as one group.
          </p>
        </button>
      </div>
    );
  }

  if (step === 'email') {
    return shell(
      <form
        className={`${card} space-y-4`}
        onSubmit={(e) => {
          e.preventDefault();
          void sendCode();
        }}
      >
        <h2 className="font-black text-lg text-slate-900 dark:text-white">
          {flow === 'register' ? 'Register your school' : 'Join your school'}
        </h2>
        {flow === 'register' && (
          <label className="block">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">School name</span>
            <input
              className={`${inputClass} mt-1`}
              value={schoolName}
              maxLength={100}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="Greenfield College"
              required
            />
          </label>
        )}
        <label className="block">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">School email address</span>
          <input
            className={`${inputClass} mt-1`}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@yourschool.edu"
            required
          />
          <span className="text-xs text-slate-600 dark:text-slate-400 mt-1 block">
            {flow === 'register'
              ? 'Must be on your school’s own domain. Personal addresses (Gmail, Yahoo…) can’t be used.'
              : 'Personal addresses (Gmail, Yahoo…) can’t be used.'}
          </span>
        </label>
        {error && (
          <p className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
          </p>
        )}
        <div className="flex gap-3 flex-wrap">
          <button type="submit" className={primaryBtn} disabled={busy || !email || (flow === 'register' && !schoolName)}>
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Send verification code
          </button>
          <button type="button" className={secondaryBtn} onClick={() => setStep('choose')} disabled={busy}>
            Back
          </button>
        </div>
      </form>
    );
  }

  // step === 'code'
  return shell(
    <form
      className={`${card} space-y-4`}
      onSubmit={(e) => {
        e.preventDefault();
        void submitCode();
      }}
    >
      <h2 className="font-black text-lg text-slate-900 dark:text-white">Enter your code</h2>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        We sent a 6-digit code to <strong>{sent?.sentTo}</strong>. It expires in {Math.round((sent?.expiresInSeconds ?? 600) / 60)}{' '}
        minutes. Check your spam folder if you don’t see it.
      </p>
      <div>
        <div className="flex items-center gap-2 mb-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
          <KeyRound className="w-4 h-4" /> Verification code
        </div>
        <input
          className={`${inputClass} text-center text-2xl tracking-[0.5em] font-black`}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="••••••"
          autoFocus
          aria-label="6-digit verification code"
        />
      </div>
      {error && (
        <p className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
        </p>
      )}
      <div className="flex gap-3 flex-wrap">
        <button type="submit" className={primaryBtn} disabled={busy || code.length !== 6}>
          {busy && <Loader2 className="w-4 h-4 animate-spin" />} Verify
        </button>
        <button type="button" className={secondaryBtn} onClick={() => void sendCode()} disabled={busy || cooldown > 0}>
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
        </button>
        <button
          type="button"
          className={secondaryBtn}
          onClick={() => {
            setStep('email');
            setError(null);
          }}
          disabled={busy}
        >
          Change email
        </button>
      </div>
    </form>
  );
};
