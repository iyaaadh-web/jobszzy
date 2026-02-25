# Copilot Instructions — Jobszzy

This file gives concise, actionable guidance for AI coding agents working in this repository.

1) Big-picture architecture
- Frontend: React + Vite (root). Entry: `src/main.jsx` → `src/App.jsx` (routes). Dev: `npm run dev` (root `package.json`).
- Backend: Express server in `/server` (CommonJS). Entry: `server/server.js`. API routes live in `server/routes/*` and are mounted under `/api` (e.g. `/api/auth`, `/api/jobs`).
- Data: SQLite via `server/database.js` (file: `server/jobszzy.sqlite`). Database is created/seeded at startup (admin + employer seeds).
- Files: uploaded PDFs and images are stored in `server/uploads` and served at `/uploads/*`.

2) How frontend/backends communicate
- Frontend base URL: `src/utils/api.js` uses `import.meta.env.VITE_API_BASE_URL || '/api'`. In dev the frontend proxies or calls `/api` (run frontend and backend separately). In production the backend serves the built frontend from `dist` when `NODE_ENV=production`.
- Auth: frontend stores JWT in `localStorage['token']`; `api` adds `Authorization: Bearer <token>` header. See `src/context/AuthContext.jsx` for login/register/upload patterns.

3) Important developer workflows
- Start frontend (hot reload): at repo root run `npm install` then `npm run dev`.
- Start backend: `cd server && npm install && npm start` (server reads root `.env` — `server/server.js` calls `dotenv` with `../.env`).
- To run both locally, open two terminals: frontend dev + backend start. Ensure `VITE_API_BASE_URL` is set if backend is on non-default path/host/port.
- Build frontend for production: `npm run build`. Backend will serve `dist` when `NODE_ENV=production`.

4) Project-specific conventions & patterns
- API namespace: everything under `server/routes` is mounted at `/api/<name>` in `server/server.js`.
- Multipart uploads: `multer` stores files to `server/uploads/`. Job PDF upload field is `job_pdf` (see `server/routes/jobs.js`). User registration optionally accepts `logo` as multipart field.
- Role checks: `server/middleware/auth.js` exposes `verifyToken`, `isEmployerOrAdmin`, `isAdmin`. Many protected routes call `verifyToken` then role-check middleware.
- DB seeds: `server/database.js` seeds an admin (sales@fasmala.com / Idhu@0412.) and an employer (employer@jobszzy.com / employer123). Be cautious when modifying seeds.

5) Integration & runtime notes
- Environment: server looks for `.env` in repo root. Typical vars: `PORT`, `NODE_ENV`. Frontend uses `VITE_API_BASE_URL` for API base.
- Static serving: In production the backend serves frontend `dist` and acts as SPA fallback for non-`/api` routes.
- File URLs: uploaded files are referenced by paths like `/uploads/<filename>` and served by Express static middleware.

6) Useful examples (copyable)
- Fetch job list (client uses `api`): GET `/api/jobs`
- Post job with PDF (multipart): POST `/api/jobs` with fields `title, company, location, type, ...` and file field `job_pdf` (protected: employer/admin)
- Verify session on load: frontend GET `/api/auth/me` using stored token (see `AuthContext.jsx`).

7) Where to look first when debugging
- Server startup & routes: `server/server.js` and `server/routes/*`
- Database schema & seeds: `server/database.js`
- Frontend API wrapper + env: `src/utils/api.js` and `.env` / `VITE_API_BASE_URL`
- Auth flow and token usage: `src/context/AuthContext.jsx` and `server/middleware/auth.js`

If anything here is unclear or you'd like more examples (cURL, Postman collections, or adding script shortcuts), tell me which sections to expand.
