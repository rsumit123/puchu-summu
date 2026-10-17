import { fetchContent, CONTENT_URL } from '../content/useContent';
import defaults from '../data/defaultContent';
import { resizeImage } from './resize';

export class AuthError extends Error {}

const TOKEN_KEY = 'puchu_admin_token';

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* private mode: the session just won't be remembered */
  }
};

async function call(path, { method = 'POST', body, token } = {}) {
  const headers = { 'content-type': 'application/json' };
  if (token) headers.authorization = `Bearer ${token}`;
  const r = await fetch(path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  let data = null;
  try {
    data = await r.json();
  } catch {
    /* non-JSON error page */
  }
  if (r.status === 401 && token) throw new AuthError(data?.error || 'Signed out');
  if (!r.ok) throw new Error(data?.error || `Request failed (${r.status})`);
  return data;
}

export const login = (password) => call('/api/login', { body: { password } }).then((d) => d.token);

export const saveContent = (token, doc) => call('/api/content', { method: 'PUT', body: doc, token }).then((d) => d.content);

// Always the live file (bypassing the 30s cache); the built-in content if none exists yet.
export async function loadDraft() {
  return (await fetchContent(`${CONTENT_URL}?t=${Date.now()}`)) || defaults;
}

// Resize, ask the server for a presigned POST, send the photo straight to S3.
export async function uploadPhoto(token, file) {
  const blob = await resizeImage(file);
  const post = await call('/api/upload-url', { body: { contentType: blob.type }, token });
  const form = new FormData();
  Object.entries(post.fields).forEach(([k, v]) => form.append(k, v));
  form.append('file', blob); // S3 requires the file to be the last field
  const r = await fetch(post.url, { method: 'POST', body: form });
  if (!r.ok) throw new Error('Photo upload failed — please try again');
  return post.publicUrl;
}
