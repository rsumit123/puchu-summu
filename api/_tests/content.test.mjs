import test from 'node:test';
import assert from 'node:assert/strict';
import { validateContent, ValidationError } from '../_lib/content.mjs';

const base = () => ({
  version: 1,
  dates: [{ date: '2018-02-06', event: 'First Date', emoji: '❤️' }],
  moments: [{ id: 'm1', title: 'Trip', description: 'Fun', image: 'https://x.test/a.jpg' }],
  gallery: ['/images/puju8.jpg', 'https://x.test/b.jpg'],
  message: 'hello',
  words: [{ value: 'baby', count: 10 }],
});

test('accepts a valid document and returns it cleaned', () => {
  const out = validateContent(base());
  assert.equal(out.version, 1);
  assert.equal(out.dates[0].event, 'First Date');
});

test('trims strings and drops unknown keys', () => {
  const doc = base();
  doc.message = '  hi  ';
  doc.dates[0].event = '  Party ';
  doc.dates[0].evil = 'x';
  const out = validateContent(doc);
  assert.equal(out.message, 'hi');
  assert.equal(out.dates[0].event, 'Party');
  assert.equal('evil' in out.dates[0], false);
});

test('emoji is optional', () => {
  const doc = base();
  delete doc.dates[0].emoji;
  assert.equal(validateContent(doc).dates[0].emoji, '');
});

test('rejects non-objects', () => {
  assert.throws(() => validateContent(null), ValidationError);
  assert.throws(() => validateContent([]), ValidationError);
  assert.throws(() => validateContent('x'), ValidationError);
});

test('rejects bad dates', () => {
  for (const d of ['2018-2-6', '06-02-2018', 'tomorrow', '2018-13-01', '2018-02-30', '']) {
    const doc = base();
    doc.dates[0].date = d;
    assert.throws(() => validateContent(doc), ValidationError, d);
  }
});

test('rejects empty event name', () => {
  const doc = base();
  doc.dates[0].event = '   ';
  assert.throws(() => validateContent(doc), ValidationError);
});

test('image urls must be https or /images/ paths', () => {
  for (const bad of ['http://x.test/a.jpg', 'javascript:alert(1)', 'data:image/png;base64,AA', '//evil.test/a.jpg', '/etc/passwd', '']) {
    const doc = base();
    doc.moments[0].image = bad;
    assert.throws(() => validateContent(doc), ValidationError, bad);
    const doc2 = base();
    doc2.gallery = [bad];
    assert.throws(() => validateContent(doc2), ValidationError, bad);
  }
});

test('enforces list size limits', () => {
  const doc = base();
  doc.dates = Array.from({ length: 201 }, () => ({ date: '2020-01-01', event: 'x' }));
  assert.throws(() => validateContent(doc), ValidationError);
  const doc2 = base();
  doc2.gallery = Array.from({ length: 61 }, () => '/images/a.jpg');
  assert.throws(() => validateContent(doc2), ValidationError);
  const doc3 = base();
  doc3.words = Array.from({ length: 301 }, (_, i) => ({ value: 'w' + i, count: 1 }));
  assert.throws(() => validateContent(doc3), ValidationError);
});

test('caps string lengths by truncating nothing silently: rejects too long', () => {
  const doc = base();
  doc.message = 'x'.repeat(4001);
  assert.throws(() => validateContent(doc), ValidationError);
  const doc2 = base();
  doc2.moments[0].title = 'x'.repeat(81);
  assert.throws(() => validateContent(doc2), ValidationError);
});

test('word counts must be integers 1..100000', () => {
  for (const c of [0, -1, 1.5, 100001, '5', null]) {
    const doc = base();
    doc.words[0].count = c;
    assert.throws(() => validateContent(doc), ValidationError, String(c));
  }
});

test('moments without an id get a stable generated one', () => {
  const doc = base();
  delete doc.moments[0].id;
  const out = validateContent(doc);
  assert.match(out.moments[0].id, /^m/);
});

test('empty lists are allowed', () => {
  const doc = { version: 1, dates: [], moments: [], gallery: [], message: '', words: [] };
  assert.deepEqual(validateContent(doc).dates, []);
});
