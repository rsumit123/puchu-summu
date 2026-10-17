# Puchu-Summu admin panel — design

Date: 2026-10-17. Status: approved by the owner in conversation.

## Goal

Let the owner edit the site without touching code: special dates, trip cards
("fun moments"), hero gallery photos, the love message and the word cloud —
including uploading new photos. Changes appear on `puchu-summu.skdev.one`
immediately, with no rebuild and no git commit.

## Non-goals

Multiple users, edit history/undo, migrating the existing photos off
`sumits-private-storage` (they stay as plain URLs), image cropping.

## Architecture

```
browser /admin ──login──▶ /api/login ──▶ signed token
        │  PUT /api/content (token) ─────────▶ S3 puchu-summu-site/content.json
        │  POST /api/upload-url (token) ──▶ presigned POST
        └──── photo straight to S3 ─────────▶ S3 puchu-summu-site/photos/…
public site ── GET content.json (public read) ◀── S3
```

- Static Vite + React app, unchanged hosting (Vercel project `puchu-summu`).
- `/admin` is a client-side route (no router library): `main.jsx` renders the
  admin app when `location.pathname === '/admin'`. `vercel.json` rewrites
  `/admin` to `index.html`.
- Three Vercel functions in `/api` (ESM `.mjs`, same style as `skdev-one`).
- Storage: a **new dedicated bucket** `puchu-summu-site`, ap-south-1.
  Not the existing `sumits-private-storage`, whose policy lets anyone write
  and delete (flagged to the owner separately).

## AWS

- Bucket `puchu-summu-site`: public `s3:GetObject` only; no public list/put/
  delete. Block Public ACLs on; public *policy* allowed.
- CORS: GET from `*`; POST/PUT only from `https://puchu-summu.skdev.one`,
  `https://puchu-summu.vercel.app`, `http://localhost:5173`, `http://localhost:3000`.
- IAM user `puchu-summu-admin`: `PutObject` + `DeleteObject` on
  `arn:aws:s3:::puchu-summu-site/*` only. Keys live in Vercel env vars.

## Environment variables (Vercel, never in the repo)

`ADMIN_PASSWORD`, `SESSION_SECRET`, `S3_BUCKET`, `PUCHU_AWS_REGION`,
`PUCHU_AWS_ACCESS_KEY_ID`, `PUCHU_AWS_SECRET_ACCESS_KEY`.
(The `PUCHU_` prefix avoids Vercel's reserved `AWS_*` names.)

## Data: `content.json`

```json
{
  "version": 1,
  "dates":   [{ "date": "2018-02-06", "event": "First Date", "emoji": "❤️" }],
  "moments": [{ "id": "m1", "title": "", "description": "", "image": "https://…" }],
  "gallery": ["https://…"],
  "message": "text",
  "words":   [{ "value": "baby", "count": 1031 }]
}
```

Validation (`api/_lib/content.mjs`, used server-side; the admin UI mirrors the
limits): max 200 dates, 60 moments, 60 gallery photos, 300 words; strings
trimmed and length-capped (title 80, description 400, message 4000, word 40,
event 80, emoji 8); `date` must be `YYYY-MM-DD`; image URLs must be `https:` or
a same-site path starting `/images/`; counts are integers 1–100000. Text is only
ever rendered as React text, never HTML.

## API

| Route | Auth | Behaviour |
|---|---|---|
| `POST /api/login` `{password}` | – | Constant-time compare with `ADMIN_PASSWORD`. Returns `{token}` (HMAC-SHA256 over an expiry, 7 days). Best-effort throttle: 5 failures per IP per 15 min → 429. |
| `PUT /api/content` | Bearer token | Validates body, writes `content.json` (`Cache-Control: public, max-age=30`). |
| `POST /api/upload-url` `{contentType}` | Bearer token | Returns a presigned **POST** for `photos/<time>-<rand>.<ext>` with conditions: content-type in {jpeg, png, webp}, size ≤ 8 MB. Returns `{url, fields, publicUrl}`. |

The throttle is in-memory per function instance, so it is a speed bump rather
than a guarantee; the password is stored only as an env var and compared in
constant time.

## Admin UI

Password screen → tabs **Dates · Trips · Photos · Message & Words**. Each tab
is a simple list editor (add / edit / delete / reorder where it matters). Photos
are resized in the browser to ≤1600 px JPEG before upload. A single **Save**
button publishes the whole document; unsaved-changes warning on the button.
The token is kept in `localStorage`; a 401 sends the user back to login.

## Public site

`useContent()` starts from the bundled defaults (`src/data/defaultContent.js`,
so there is no flash and no outage if S3 is unreachable), then fetches
`content.json` and swaps it in only if it passes a light shape check.
Calendar uses the date's `emoji` when present, else the existing icon map.

## Testing

`node --test` unit tests for validation, token sign/verify, throttling and the
upload-condition builder (no AWS calls — the S3 client is injected). Then a real
end-to-end check on the deployed site: login, edit, upload, public page updates.
