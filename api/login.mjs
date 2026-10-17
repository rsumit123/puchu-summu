// POST /api/login  { password }  ->  { token }
// One shared password (ADMIN_PASSWORD). Failures are throttled per IP.

import { checkPassword, signToken, createThrottle } from './_lib/auth.mjs';

const defaultThrottle = createThrottle({ max: 5, windowMs: 15 * 60 * 1000 });

const clientIp = (req) => {
  const fwd = req.headers?.['x-forwarded-for'];
  return (typeof fwd === 'string' && fwd.split(',')[0].trim()) || 'unknown';
};

export function makeLoginHandler({ env = process.env, throttle = defaultThrottle } = {}) {
  return async function handler(req, res) {
    res.setHeader('cache-control', 'no-store');
    if (req.method !== 'POST') {
      res.setHeader('allow', 'POST');
      return res.status(405).json({ error: 'method not allowed' });
    }
    if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
      return res.status(503).json({ error: 'admin is not configured' });
    }

    const ip = clientIp(req);
    if (throttle.isBlocked(ip)) {
      return res.status(429).json({ error: 'too many attempts, try again in 15 minutes' });
    }

    const supplied = req.body && typeof req.body === 'object' ? req.body.password : undefined;
    if (!checkPassword(supplied, env.ADMIN_PASSWORD)) {
      throttle.recordFailure(ip);
      return res.status(401).json({ error: 'wrong password' });
    }

    throttle.reset(ip);
    return res.status(200).json({ token: signToken(env.SESSION_SECRET) });
  };
}

export default makeLoginHandler();
