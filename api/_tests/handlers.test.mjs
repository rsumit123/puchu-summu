import test from 'node:test';
import assert from 'node:assert/strict';
import { createThrottle, signToken } from '../_lib/auth.mjs';
import { makeLoginHandler } from '../login.mjs';
import { makeContentHandler } from '../content.mjs';
import { makeUploadHandler } from '../upload-url.mjs';

const env = { ADMIN_PASSWORD: 'test-password-1', SESSION_SECRET: 'handler-test-secret-handler-test-secret' };

const mkRes = () => {
  const r = { code: 200, headers: {}, body: undefined };
  r.status = (c) => { r.code = c; return r; };
  r.setHeader = (k, v) => { r.headers[k.toLowerCase()] = v; return r; };
  r.json = (b) => { r.body = b; return r; };
  r.end = () => r;
  return r;
};
const req = (method, body, headers = {}) => ({ method, body, headers });
const authed = () => ({ authorization: `Bearer ${signToken(env.SESSION_SECRET)}` });

// ---------------------------------------------------------------- login
test('login: right password returns a token', async () => {
  const h = makeLoginHandler({ env, throttle: createThrottle() });
  const res = mkRes();
  await h(req('POST', { password: 'test-password-1' }), res);
  assert.equal(res.code, 200);
  assert.match(res.body.token, /^\d+\.[0-9a-f]{64}$/);
  assert.equal(res.headers['cache-control'], 'no-store');
});

test('login: wrong password is 401 and does not leak which part failed', async () => {
  const h = makeLoginHandler({ env, throttle: createThrottle() });
  const res = mkRes();
  await h(req('POST', { password: 'nope' }), res);
  assert.equal(res.code, 401);
  assert.equal(res.body.token, undefined);
});

test('login: 5 failures then even the right password is blocked with 429', async () => {
  const h = makeLoginHandler({ env, throttle: createThrottle({ max: 5 }) });
  const headers = { 'x-forwarded-for': '9.9.9.9, 10.0.0.1' };
  for (let i = 0; i < 5; i++) await h(req('POST', { password: 'bad' }, headers), mkRes());
  const res = mkRes();
  await h(req('POST', { password: 'test-password-1' }, headers), res);
  assert.equal(res.code, 429);
  const other = mkRes();
  await h(req('POST', { password: 'test-password-1' }, { 'x-forwarded-for': '8.8.8.8' }), other);
  assert.equal(other.code, 200);
});

test('login: a success clears earlier failures', async () => {
  const th = createThrottle({ max: 3 });
  const h = makeLoginHandler({ env, throttle: th });
  await h(req('POST', { password: 'bad' }), mkRes());
  await h(req('POST', { password: 'bad' }), mkRes());
  await h(req('POST', { password: 'test-password-1' }), mkRes());
  await h(req('POST', { password: 'bad' }), mkRes());
  const res = mkRes();
  await h(req('POST', { password: 'test-password-1' }), res);
  assert.equal(res.code, 200);
});

test('login: only POST; unconfigured is 503; bad body is 400-ish', async () => {
  const h = makeLoginHandler({ env, throttle: createThrottle() });
  const get = mkRes();
  await h(req('GET'), get);
  assert.equal(get.code, 405);
  const un = mkRes();
  await makeLoginHandler({ env: {}, throttle: createThrottle() })(req('POST', { password: 'x' }), un);
  assert.equal(un.code, 503);
  const bad = mkRes();
  await h(req('POST', undefined), bad);
  assert.equal(bad.code, 401);
});

// -------------------------------------------------------------- content
const goodDoc = { version: 1, dates: [], moments: [], gallery: [], message: 'hi', words: [] };

test('content: requires auth', async () => {
  const saved = [];
  const h = makeContentHandler({ env, s3: { putContent: async (d) => saved.push(d) } });
  for (const headers of [{}, { authorization: 'Bearer nope' }]) {
    const res = mkRes();
    await h(req('PUT', goodDoc, headers), res);
    assert.equal(res.code, 401);
  }
  assert.equal(saved.length, 0);
});

test('content: saves validated content and returns the cleaned copy', async () => {
  const saved = [];
  const h = makeContentHandler({ env, s3: { putContent: async (d) => saved.push(d) } });
  const res = mkRes();
  await h(req('PUT', { ...goodDoc, message: '  hi  ' }, authed()), res);
  assert.equal(res.code, 200);
  assert.equal(saved[0].message, 'hi');
  assert.equal(res.body.content.message, 'hi');
});

test('content: invalid content is 400 with the reason and nothing is written', async () => {
  const saved = [];
  const h = makeContentHandler({ env, s3: { putContent: async (d) => saved.push(d) } });
  const res = mkRes();
  await h(req('PUT', { ...goodDoc, dates: [{ date: 'bad', event: 'x' }] }, authed()), res);
  assert.equal(res.code, 400);
  assert.match(res.body.error, /date/);
  assert.equal(saved.length, 0);
});

test('content: only PUT; storage failure is 502 without leaking details', async () => {
  const h = makeContentHandler({ env, s3: { putContent: async () => { throw new Error('secret internals'); } } });
  const post = mkRes();
  await h(req('POST', goodDoc, authed()), post);
  assert.equal(post.code, 405);
  const res = mkRes();
  await h(req('PUT', goodDoc, authed()), res);
  assert.equal(res.code, 502);
  assert.doesNotMatch(JSON.stringify(res.body), /secret internals/);
});

// ---------------------------------------------------------- upload-url
test('upload-url: requires auth, then returns the presigned post', async () => {
  const h = makeUploadHandler({ env, s3: { buildUploadPost: async (t) => ({ url: 'u', fields: {}, publicUrl: 'p', t }) } });
  const no = mkRes();
  await h(req('POST', { contentType: 'image/jpeg' }), no);
  assert.equal(no.code, 401);
  const ok = mkRes();
  await h(req('POST', { contentType: 'image/jpeg' }, authed()), ok);
  assert.equal(ok.code, 200);
  assert.equal(ok.body.publicUrl, 'p');
});

test('upload-url: bad type is 400, only POST', async () => {
  const h = makeUploadHandler({
    env,
    s3: { buildUploadPost: async () => { const e = new Error('Unsupported image type'); e.code = 'BAD_TYPE'; throw e; } },
  });
  const bad = mkRes();
  await h(req('POST', { contentType: 'text/html' }, authed()), bad);
  assert.equal(bad.code, 400);
  const get = mkRes();
  await h(req('GET', undefined, authed()), get);
  assert.equal(get.code, 405);
});
