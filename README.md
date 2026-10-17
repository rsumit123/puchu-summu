# Puchu & Summu

Anniversary site (Vite + React) at https://puchu-summu.skdev.one, with an admin
page at `/admin` for editing dates, trips, hero photos, the message and the
word cloud — including photo uploads. Edits go live immediately.

## How it works

- Content lives in `content.json` in the public-read S3 bucket
  `puchu-summu-site` (ap-south-1), together with uploaded photos under `photos/`.
- The public site renders the bundled defaults (`src/data/defaultContent.js`),
  then swaps in `content.json` once fetched. If the fetch fails the defaults stay.
- `/api/login`, `/api/content`, `/api/upload-url` (Vercel functions) check one
  shared password and write to the bucket. Uploads go straight from the browser
  to S3 through a presigned POST limited to 8 MB of JPEG/PNG/WebP.
- Design and plan: `docs/superpowers/specs/`, `docs/superpowers/plans/`.

## Vercel environment variables

| Name | Purpose |
|---|---|
| `ADMIN_PASSWORD` | the admin password |
| `SESSION_SECRET` | random string used to sign login tokens (changing it signs everyone out) |
| `S3_BUCKET` | `puchu-summu-site` |
| `PUCHU_AWS_REGION` | `ap-south-1` |
| `PUCHU_AWS_ACCESS_KEY_ID` / `PUCHU_AWS_SECRET_ACCESS_KEY` | IAM user `puchu-summu-admin` (put/delete on that bucket only) |

## Develop

```
npm install
npm test          # unit tests for validation, auth, S3 and handlers
npm run dev       # site only; /api needs `vercel dev` or equivalent
```
