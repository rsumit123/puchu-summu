// Validation for content.json. Throws ValidationError with a message safe to
// show the admin; returns a cleaned copy (unknown keys dropped, strings trimmed).

export class ValidationError extends Error {}

const LIMITS = {
  dates: 200,
  moments: 60,
  gallery: 60,
  words: 300,
  event: 80,
  emoji: 8,
  title: 80,
  description: 400,
  message: 4000,
  word: 40,
  url: 500,
  id: 40,
  maxCount: 100000,
};

const fail = (msg) => { throw new ValidationError(msg); };

const str = (v, label, max, { required = false } = {}) => {
  if (v === undefined || v === null) v = '';
  if (typeof v !== 'string') fail(`${label} must be text`);
  const s = v.trim();
  if (required && !s) fail(`${label} is required`);
  if (s.length > max) fail(`${label} is too long (max ${max})`);
  return s;
};

const list = (v, label, max) => {
  if (!Array.isArray(v)) fail(`${label} must be a list`);
  if (v.length > max) fail(`${label} has too many items (max ${max})`);
  return v;
};

const obj = (v, label) => {
  if (!v || typeof v !== 'object' || Array.isArray(v)) fail(`${label} must be an object`);
  return v;
};

export function isoDate(v, label) {
  const s = str(v, label, 10, { required: true });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) fail(`${label} must look like YYYY-MM-DD`);
  const d = new Date(`${s}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s) fail(`${label} is not a real date`);
  return s;
}

// Only https URLs or same-site /images/ paths. Never http, data:, javascript:
// or protocol-relative URLs.
export function imageUrl(v, label) {
  const s = str(v, label, LIMITS.url, { required: true });
  if (s.startsWith('/images/') && !s.includes('..') && !s.includes('//')) return s;
  if (s.startsWith('https://')) {
    try {
      const u = new URL(s);
      if (u.protocol === 'https:' && u.hostname) return s;
    } catch { /* fall through */ }
  }
  return fail(`${label} must be an https link or an /images/ path`);
}

let idCounter = 0;
const newId = () => `m${Date.now().toString(36)}${(idCounter++).toString(36)}`;

export function validateContent(input) {
  const doc = obj(input, 'content');

  const dates = list(doc.dates ?? [], 'dates', LIMITS.dates).map((d, i) => {
    const o = obj(d, `date #${i + 1}`);
    return {
      date: isoDate(o.date, `date #${i + 1}`),
      event: str(o.event, `event #${i + 1}`, LIMITS.event, { required: true }),
      emoji: str(o.emoji, `emoji #${i + 1}`, LIMITS.emoji),
    };
  });

  const moments = list(doc.moments ?? [], 'trips', LIMITS.moments).map((m, i) => {
    const o = obj(m, `trip #${i + 1}`);
    return {
      id: str(o.id, `trip #${i + 1} id`, LIMITS.id) || newId(),
      title: str(o.title, `trip #${i + 1} title`, LIMITS.title, { required: true }),
      description: str(o.description, `trip #${i + 1} description`, LIMITS.description),
      image: imageUrl(o.image, `trip #${i + 1} photo`),
    };
  });

  const gallery = list(doc.gallery ?? [], 'gallery', LIMITS.gallery)
    .map((u, i) => imageUrl(u, `gallery photo #${i + 1}`));

  const message = str(doc.message, 'message', LIMITS.message);

  const words = list(doc.words ?? [], 'words', LIMITS.words).map((w, i) => {
    const o = obj(w, `word #${i + 1}`);
    if (!Number.isInteger(o.count) || o.count < 1 || o.count > LIMITS.maxCount) {
      fail(`word #${i + 1} count must be a whole number from 1 to ${LIMITS.maxCount}`);
    }
    return { value: str(o.value, `word #${i + 1}`, LIMITS.word, { required: true }), count: o.count };
  });

  return { version: 1, dates, moments, gallery, message, words };
}
