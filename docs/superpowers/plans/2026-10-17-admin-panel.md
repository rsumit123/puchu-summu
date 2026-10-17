# Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** An `/admin` page, protected by one password, to edit dates, trips, hero photos, message and word cloud, with photo upload — changes live instantly.

**Architecture:** Content is one `content.json` in a dedicated public-read S3 bucket. Three Vercel functions (login, save content, presigned upload) write to it. The public site renders bundled defaults, then swaps in `content.json` once fetched.

**Tech Stack:** Vite + React 18, Vercel functions (`.mjs`), `@aws-sdk/client-s3`, `@aws-sdk/s3-presigned-post`, `node --test`.

Spec: `docs/superpowers/specs/2026-10-17-admin-panel-design.md`

## File structure

| File | Responsibility |
|---|---|
| `api/_lib/content.mjs` | `validateContent(obj)` → cleaned object or throws `ValidationError` |
| `api/_lib/auth.mjs` | `signToken`, `verifyToken`, `checkPassword`, `createThrottle`, `requireAuth` |
| `api/_lib/s3.mjs` | S3 client factory + `putContent`, `buildUploadPost` (client injectable) |
| `api/login.mjs`, `api/content.mjs`, `api/upload-url.mjs` | HTTP handlers, thin |
| `api/_tests/*.test.mjs` | `node --test` unit tests |
| `src/data/defaultContent.js` | Today's hardcoded content, seed + fallback |
| `src/content/useContent.js` | Fetch + fallback hook, `CONTENT_URL` |
| `src/admin/*` | `AdminApp`, `Login`, `DatesTab`, `TripsTab`, `PhotosTab`, `TextTab`, `api.js`, `resize.js`, `admin.css` |
| `src/main.jsx` | Route `/admin` → `AdminApp` |
| `vercel.json` | Rewrite `/admin` → `/index.html` |

## Tasks

1. **Infra** (done): bucket, policy, CORS, IAM user; env vars set in Vercel *(blocked: connector lacks permission — owner or CLI)*.
2. **Validation** — `content.mjs` + tests (limits, date format, URL rules, trimming).
3. **Auth** — `auth.mjs` + tests (token round-trip, expiry, tamper, wrong password, throttle).
4. **S3 + handlers** — `s3.mjs` (injected client), three handlers + tests for upload conditions and handler status codes.
5. **Defaults + public wiring** — `defaultContent.js`, `useContent.js`; point Calendar, FunMoments, PhotoGallery, SpecialMessage, WordCloud at it.
6. **Admin UI** — login, tabs, resize, save.
7. **Seed** — upload initial `content.json` (from defaults) to the bucket; verify public GET.
8. **Deploy + verify** — push, set env vars, test login/save/upload on the live URL.

Commands: `npm test` (runs `node --test api/_tests`), `npm run build`, `npm run lint`.
