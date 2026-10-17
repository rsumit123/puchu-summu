// PUT /api/content  <content.json body>  (Bearer token)
// Validates, then writes content.json to the site bucket.

import { isAuthed } from './_lib/auth.mjs';
import { validateContent, ValidationError } from './_lib/content.mjs';
import { createS3 } from './_lib/s3.mjs';

export function makeContentHandler({ env = process.env, s3 = createS3(env) } = {}) {
  return async function handler(req, res) {
    res.setHeader('cache-control', 'no-store');
    if (req.method !== 'PUT') {
      res.setHeader('allow', 'PUT');
      return res.status(405).json({ error: 'method not allowed' });
    }
    if (!isAuthed(req, env.SESSION_SECRET)) return res.status(401).json({ error: 'not signed in' });

    let content;
    try {
      content = validateContent(req.body);
    } catch (err) {
      if (err instanceof ValidationError) return res.status(400).json({ error: err.message });
      throw err;
    }

    try {
      await s3.putContent(content);
    } catch (err) {
      console.error('content save failed:', err?.name, err?.message);
      const unconfigured = err?.code === 'NOT_CONFIGURED';
      return res.status(unconfigured ? 503 : 502).json({ error: unconfigured ? 'storage is not configured' : 'could not save, try again' });
    }
    return res.status(200).json({ saved: true, content });
  };
}

export default makeContentHandler();
