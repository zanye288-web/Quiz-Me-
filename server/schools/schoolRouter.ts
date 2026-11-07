import { Router, Response, NextFunction } from 'express';
import { requireAuth, AuthRequest } from '../../src/middleware/auth.ts';
import { adminDb } from '../../src/lib/firebase-admin.ts';
import { createRateLimiter } from '../securityMiddleware';
import { defaultMailer } from './mailer';
import { FirestoreSchoolStore } from './schoolStore';
import { Actor, SchoolError, createSchoolService } from './schoolService';

/**
 * School accounts API (mounted at /api/schools).
 *
 *   GET    /me                  current membership (or null)
 *   POST   /register/start      { schoolName, email }  -> emails a code to prove domain ownership
 *   POST   /join/start          { email }              -> emails a code to a registered school's domain
 *   POST   /verify              { code }               -> completes either flow
 *   GET    /roster              school admin only
 *   DELETE /membership          leave your school
 *   DELETE /members/:uid        school admin removes a member
 */
export const schoolRouter = Router();

const service = createSchoolService({
  store: new FirestoreSchoolStore(adminDb),
  mailer: defaultMailer,
});

// Coarse per-IP limit on top of the per-account / per-inbox limits in the service.
const schoolIpRateLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 30,
  name: 'School verification',
});

schoolRouter.use((_req, res: Response, next: NextFunction) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});
schoolRouter.use(schoolIpRateLimiter);
schoolRouter.use(requireAuth);

function actorFrom(req: AuthRequest): Actor {
  const token = req.user;
  if (!token) throw new SchoolError(401, 'unauthorized', 'Please sign in.');
  const fallbackName = token.email ? token.email.split('@')[0] : 'Scholar';
  return {
    uid: token.uid,
    displayName: (typeof token.name === 'string' && token.name.trim()) || fallbackName,
    isAnonymous: token.firebase?.sign_in_provider === 'anonymous',
  };
}

function handle(fn: (req: AuthRequest, res: Response) => Promise<void>) {
  return async (req: AuthRequest, res: Response) => {
    try {
      await fn(req, res);
    } catch (err) {
      if (err instanceof SchoolError) {
        if (err.retryAfterSeconds) res.setHeader('Retry-After', String(err.retryAfterSeconds));
        res.status(err.status).json({
          success: false,
          code: err.code,
          error: err.message,
          ...(err.retryAfterSeconds ? { retryAfter: err.retryAfterSeconds } : {}),
        });
        return;
      }
      // Never leak internals (credentials problems, stack traces) to the client.
      console.error('[schools] Unexpected error:', err);
      res.status(500).json({
        success: false,
        code: 'server_error',
        error: 'Something went wrong on our side. Please try again in a moment.',
      });
    }
  };
}

schoolRouter.get(
  '/me',
  handle(async (req, res) => {
    const membership = await service.getMembership(actorFrom(req));
    res.json({ success: true, membership });
  })
);

schoolRouter.post(
  '/register/start',
  handle(async (req, res) => {
    const body = req.body ?? {};
    const sent = await service.startRegistration(actorFrom(req), {
      schoolName: body.schoolName,
      email: body.email,
    });
    res.json({ success: true, ...sent });
  })
);

schoolRouter.post(
  '/join/start',
  handle(async (req, res) => {
    const body = req.body ?? {};
    const sent = await service.startJoin(actorFrom(req), { email: body.email });
    res.json({ success: true, ...sent });
  })
);

schoolRouter.post(
  '/verify',
  handle(async (req, res) => {
    const body = req.body ?? {};
    const membership = await service.verifyCode(actorFrom(req), { code: body.code });
    res.json({ success: true, membership });
  })
);

schoolRouter.get(
  '/roster',
  handle(async (req, res) => {
    const roster = await service.listRoster(actorFrom(req));
    res.json({ success: true, ...roster });
  })
);

schoolRouter.delete(
  '/membership',
  handle(async (req, res) => {
    await service.leave(actorFrom(req));
    res.json({ success: true });
  })
);

schoolRouter.delete(
  '/members/:uid',
  handle(async (req, res) => {
    const uid = String(req.params.uid ?? '');
    if (!uid || uid.length > 128) {
      throw new SchoolError(400, 'invalid_member', 'Invalid member.');
    }
    await service.removeMember(actorFrom(req), uid);
    res.json({ success: true });
  })
);
