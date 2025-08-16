# Fyndr.AI – Copilot instructions

Purpose: equip AI coding agents with concrete, repo‑specific context to be productive in this Django + React monorepo and avoid common pitfalls.

## Workflow rules
- Do NOT run frontend builds during development. The Vite dev server is running; changes hot‑reload. Only run a build if the user explicitly asks for a production build or artifacts.
- Prefer backend `python manage.py check` or targeted tests over full rebuilds.
- When in doubt, read files and apply minimal patches; avoid unnecessary commands.

## Architecture
- Backend (Django 4, DRF, Channels) in `backend/`:
  - `fyndr_auth`: users, profiles, uploads, Google OAuth. Routes under `/api/auth/` (see `backend/fyndr_auth/urls.py`).
  - `jobapplier`: job applications, events, tracking, real‑time. Routes under `/api/applications/` (see `backend/jobapplier/urls.py`). WebSocket consumer at `/ws/applications/`.
  - `jobscraper`: job listings; included at root path in `backend/fyndr_backend/urls.py`.
  - `jobmatcher`, `jobtracker` exist; some routes may be commented out in `backend/fyndr_backend/urls.py`. Verify before use.
- Frontend (Vite + React + Tailwind) in `frontend/`. Data access uses helpers in `src/utils/api.js`, `src/services/*`.
- Real‑time via Channels ASGI app (`backend/fyndr_backend/asgi.py`) with JWT query‑param auth (`channels_jwt.py`). Default in‑memory channel layer.

## Run (local)
- Backend (from `backend/`): `make install-dev`, `python manage.py migrate`, `make run` (serves http/ws on `http://localhost:8000`).
- Frontend (from `frontend/`): `npm i`, `npm run dev` (default `http://localhost:5173`).
- Optional Docker: `backend/docker-compose.yml` starts app, Postgres, Redis, Celery; set env first.

## API patterns (server)
- Auth/profile: `/api/auth/` (JWT via DRF SimpleJWT). Uploads: `POST /api/auth/upload/` with `file` and `type` (one of `resume|cover_letter|portfolio|profile_image|logo|brochure`).
- Binary file serve: `/api/auth/files/<model>/<profile_id>/<file_type>/` supports `Authorization: Bearer` or `?token=…`; `?download=1` forces attachment.
- Applications: `/api/applications/` exposes ViewSets plus endpoints like `quick-apply/`, `apply/<job_id>/`, `monitor-status/<uuid>/`, `dashboard/`, recruiter routes. See `backend/jobapplier/urls.py`.
- Jobs: provided by `jobscraper` (mounted at `''`).

## Real‑time patterns
- WebSocket URL: `/ws/applications/?token=<JWT>` (also `?access=`). Middleware: `backend/fyndr_backend/channels_jwt.py`.
- Consumer: `backend/jobapplier/consumers.py` joins group `user_<user_id>`; handles messages `ping`, `apply_to_job`, `update_status`; emits events:
  - `application_created`, `application_update`, `tracking_update` (event `type` must match consumer method name).
- Server helper: `backend/jobapplier/real_time_service.py` uses `group_send("user_<id>", { 'type': <consumer_method>, ... })` to notify clients.

## Frontend conventions
- Build URLs with `src/utils/api.js#getApiUrl(endpoint)`. It de‑dupes `/api` when `VITE_API_BASE_URL` already ends with `/api`.
- API base: `VITE_API_BASE_URL` or `VITE_API_URL` (fallbacks `http://localhost:8000` or `http://localhost:8000/api`). See `src/services/jobsAPI.js`, `src/utils/tokenManager.js`.
- Many pages call `/auth/profile/`, `/auth/upload/`, and `/jobapplier/*` via `getApiUrl` or `apiRequest`.

## Env and storage
- DB defaults to SQLite in dev; set `SUPABASE_DB_*` for Postgres (see `backend/fyndr_backend/settings.py`).
- Cloudinary configured for prod media; profiles also store binary blobs served via the file endpoints.
- Google OAuth endpoints: `/api/auth/oauth/google/*`; dev default callback `http://localhost:5173/oauth/google/callback` if env not set.

## Tests and quality
- Backend: `make test` (pytest supported). Tests auto‑switch DB and disable real browser automation. Lint/format: `make lint`, `make format`, coverage: `make test-cov`.
- Example flow: `backend/test_api.py` creates a job and exercises `/api/applications/*` endpoints.

## Gotchas
- Check `backend/fyndr_backend/urls.py` for temporarily disabled app includes before adding frontend calls.
- Channels layer is in‑memory; use Redis (`channels-redis`) for multi‑worker and update `CHANNEL_LAYERS`.
- File upload `type` controls validation and which fields are persisted.
- WebSocket event `type` must map to a consumer coroutine with the same name.

If anything above seems off for your branch/env (e.g., active routes, Redis/Celery), ask to confirm before wiring new features.





# Build
Frontend is always running so no need to rebuild again and again.