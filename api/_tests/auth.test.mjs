import test from 'node:test';
import assert from 'node:assert/strict';
import { signToken, verifyToken, checkPassword, createThrottle, bearer } from '../_lib/auth.mjs';

const SECRET = 'test-secret-test-secret-test-secret';
const DAY = 24 * 60 * 60 * 1000;

test('a fresh token verifies', () => {
  const t = signToken(SECRET, 1000);
  assert.equal(verifyToken(SECRET, t, 1000), true);
});

test('token expires after 7 days', () => {
  const t = signToken(SECRET, 0);
  assert.equal(verifyToken(SECRET, t, 7 * DAY - 1), true);
  assert.equal(verifyToken(SECRET, t, 7 * DAY + 1), false);
});

test('token signed with another secret is rejected', () => {
  const t = signToken('other-secret-other-secret-other!!', 0);
  assert.equal(verifyToken(SECRET, t, 1), false);
});

test('tampered expiry is rejected', () => {
  const t = signToken(SECRET, 0);
  const [, sig] = t.split('.');
  assert.equal(verifyToken(SECRET, `${99999999999999}.${sig}`, 1), false);
});

test('garbage tokens are rejected, never throw', () => {
  for (const t of [undefined, null, '', 'abc', 'a.b.c', '.', '123.', '.abc', 42, {}]) {
    assert.equal(verifyToken(SECRET, t, 1), false);
  }
});

test('verifyToken refuses when no secret is configured', () => {
  const t = signToken(SECRET, 0);
  assert.equal(verifyToken('', t, 1), false);
  assert.equal(verifyToken(undefined, t, 1), false);
  assert.throws(() => signToken('', 0));
});

test('checkPassword is exact and refuses unset passwords', () => {
  assert.equal(checkPassword('test-password-1', 'test-password-1'), true);
  assert.equal(checkPassword('TEST-PASSWORD-1', 'test-password-1'), false);
  assert.equal(checkPassword('test-password-14', 'test-password-1'), false);
  assert.equal(checkPassword('', ''), false);
  assert.equal(checkPassword('x', undefined), false);
  assert.equal(checkPassword(undefined, 'test-password-1'), false);
  assert.equal(checkPassword(['test-password-1'], 'test-password-1'), false);
});

test('throttle blocks after 5 failures within the window', () => {
  const th = createThrottle({ max: 5, windowMs: 1000 });
  for (let i = 0; i < 5; i++) {
    assert.equal(th.isBlocked('1.1.1.1', 0), false);
    th.recordFailure('1.1.1.1', 0);
  }
  assert.equal(th.isBlocked('1.1.1.1', 10), true);
  assert.equal(th.isBlocked('2.2.2.2', 10), false);
});

test('throttle unblocks after the window and on reset', () => {
  const th = createThrottle({ max: 2, windowMs: 1000 });
  th.recordFailure('a', 0);
  th.recordFailure('a', 0);
  assert.equal(th.isBlocked('a', 500), true);
  assert.equal(th.isBlocked('a', 1001), false);
  th.recordFailure('b', 0);
  th.recordFailure('b', 0);
  th.reset('b');
  assert.equal(th.isBlocked('b', 1), false);
});

test('throttle does not grow without bound', () => {
  const th = createThrottle({ max: 5, windowMs: 1000, maxKeys: 50 });
  for (let i = 0; i < 500; i++) th.recordFailure('ip' + i, i);
  assert.ok(th.size() <= 50);
});

test('bearer extracts the token from headers', () => {
  assert.equal(bearer({ headers: { authorization: 'Bearer abc.def' } }), 'abc.def');
  assert.equal(bearer({ headers: { authorization: 'bearer abc' } }), 'abc');
  assert.equal(bearer({ headers: { authorization: 'Basic abc' } }), null);
  assert.equal(bearer({ headers: {} }), null);
  assert.equal(bearer({}), null);
});
