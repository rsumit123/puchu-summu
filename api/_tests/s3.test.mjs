import test from 'node:test';
import assert from 'node:assert/strict';
import { createS3, MAX_UPLOAD_BYTES } from '../_lib/s3.mjs';

const env = { S3_BUCKET: 'bkt', PUCHU_AWS_REGION: 'ap-south-1' };

test('putContent writes content.json with json type and short cache', async () => {
  const sent = [];
  const s3 = createS3(env, { client: { send: async (c) => sent.push(c.input) } });
  await s3.putContent({ version: 1, dates: [] });
  assert.equal(sent.length, 1);
  assert.equal(sent[0].Bucket, 'bkt');
  assert.equal(sent[0].Key, 'content.json');
  assert.equal(sent[0].ContentType, 'application/json');
  assert.equal(sent[0].CacheControl, 'public, max-age=30');
  assert.deepEqual(JSON.parse(sent[0].Body), { version: 1, dates: [] });
});

test('buildUploadPost restricts type and size and returns a public url', async () => {
  let args;
  const presign = async (_client, a) => { args = a; return { url: 'https://u', fields: { k: 'v' } }; };
  const s3 = createS3(env, { client: {}, presign, now: () => 1700000000000, rand: () => 'abc123' });
  const out = await s3.buildUploadPost('image/jpeg');
  assert.equal(args.Bucket, 'bkt');
  assert.equal(args.Key, 'photos/1700000000000-abc123.jpg');
  assert.deepEqual(args.Conditions, [
    ['content-length-range', 1, MAX_UPLOAD_BYTES],
    ['eq', '$Content-Type', 'image/jpeg'],
  ]);
  assert.equal(args.Fields['Content-Type'], 'image/jpeg');
  assert.equal(args.Fields['Cache-Control'], 'public, max-age=31536000, immutable');
  assert.equal(args.Expires, 300);
  assert.equal(out.url, 'https://u');
  assert.deepEqual(out.fields, { k: 'v' });
  assert.equal(out.publicUrl, 'https://bkt.s3.ap-south-1.amazonaws.com/photos/1700000000000-abc123.jpg');
});

test('buildUploadPost maps png and webp extensions', async () => {
  const keys = [];
  const presign = async (_c, a) => { keys.push(a.Key); return { url: 'u', fields: {} }; };
  const s3 = createS3(env, { client: {}, presign, now: () => 1, rand: () => 'r' });
  await s3.buildUploadPost('image/png');
  await s3.buildUploadPost('image/webp');
  assert.deepEqual(keys, ['photos/1-r.png', 'photos/1-r.webp']);
});

test('buildUploadPost rejects other content types', async () => {
  const s3 = createS3(env, { client: {}, presign: async () => ({}) });
  for (const t of ['text/html', 'image/svg+xml', 'application/pdf', '', undefined, 'image/jpeg; x=1']) {
    await assert.rejects(() => s3.buildUploadPost(t), /image type/, String(t));
  }
});

test('missing configuration is reported as not configured', async () => {
  const s3 = createS3({}, { client: {} });
  await assert.rejects(() => s3.putContent({}), /not configured/);
});

test('public url helper', () => {
  const s3 = createS3(env, { client: {} });
  assert.equal(s3.contentUrl, 'https://bkt.s3.ap-south-1.amazonaws.com/content.json');
});
