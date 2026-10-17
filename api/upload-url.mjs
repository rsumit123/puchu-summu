// POST /api/upload-url  { contentType }  (Bearer token)
//   -> { url, fields, publicUrl }   a short-lived presigned POST for one photo

import { isAuthed } from './_lib/auth.mjs';
import { createS3 } from './_lib/s3.mjs';

export function makeUploadHandler({ env = process.env, s3 = createS3(env) } = {}) {
  return async function handler(req, res) {
    res.setHeader('cache-control', 'no-store');
    if (req.method !== 'POST') {
      res.setHeader('allow', 'POST');
      return res.status(405).json({ error: 'method not allowed' });
    }
    if (!isAuthed(req, env.SESSION_SECRET)) return res.status(401).json({ error: 'not signed in' });

    const contentType = req.body && typeof req.body === 'object' ? req.body.contentType : undefined;
    try {
      return res.status(200).json(await s3.buildUploadPost(contentType));
    } catch (err) {
      if (err?.code === 'BAD_TYPE') return res.status(400).json({ error: err.message });
      console.error('upload-url failed:', err?.name, err?.message);
      const unconfigured = err?.code === 'NOT_CONFIGURED';
      return res.status(unconfigured ? 503 : 502).json({ error: unconfigured ? 'storage is not configured' : 'could not start upload' });
    }
  };
}

export default makeUploadHandler();
