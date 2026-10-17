// Single-password admin auth. Stateless: the token is `<expiryMs>.<hmac>`.
// No dependencies: Node builtins only.

import { createHmac, createHash, timingSafeEqual } from 'node:crypto';

const TTL_MS = 7 * 24 * 60 * 60 * 1000;

const mac = (secret, payload) => createHmac('sha256', secret).update(String(payload)).digest('hex');

const safeEqual = (a, b) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export function signToken(secret, now = Date.now()) {
  if (!secret) throw new Error('SESSION_SECRET is not configured');
  const exp = now + TTL_MS;
  return `${exp}.${mac(secret, exp)}`;
}

export function verifyToken(secret, token, now = Date.now()) {
  if (!secret || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [exp, sig] = parts;
  if (!/^\d{1,16}$/.test(exp) || !/^[0-9a-f]{64}$/.test(sig)) return false;
  if (!safeEqual(sig, mac(secret, exp))) return false;
  return Number(exp) > now;
}

// Hash both sides first so the comparison length never leaks the password's.
export function checkPassword(supplied, expected) {
  if (typeof supplied !== 'string' || typeof expected !== 'string' || !expected) return false;
  const h = (s) => createHash('sha256').update(s).digest();
  return timingSafeEqual(h(supplied), h(expected));
}

// Best-effort, in-memory (per serverless instance): a speed bump, not a lock.
export function createThrottle({ max = 5, windowMs = 15 * 60 * 1000, maxKeys = 1000 } = {}) {
  const hits = new Map(); // key -> { count, first }

  const live = (key, now) => {
    const e = hits.get(key);
    if (e && now - e.first >= windowMs) {
      hits.delete(key);
      return null;
    }
    return e || null;
  };

  return {
    isBlocked(key, now = Date.now()) {
      const e = live(key, now);
      return !!e && e.count >= max;
    },
    recordFailure(key, now = Date.now()) {
      const e = live(key, now);
      if (e) {
        e.count += 1;
        return;
      }
      if (hits.size >= maxKeys) hits.delete(hits.keys().next().value); // oldest
      hits.set(key, { count: 1, first: now });
    },
    reset(key) {
      hits.delete(key);
    },
    size: () => hits.size,
  };
}

export function bearer(req) {
  const h = req?.headers?.authorization;
  if (typeof h !== 'string') return null;
  const m = /^Bearer\s+(\S+)$/i.exec(h);
  return m ? m[1] : null;
}

export const isAuthed = (req, secret = process.env.SESSION_SECRET) => verifyToken(secret, bearer(req));
