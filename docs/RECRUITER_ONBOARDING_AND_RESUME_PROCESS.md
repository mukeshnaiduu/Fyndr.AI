# Recruiter Onboarding & Resume Upload → Profile Completion

Purpose
- Document the end-to-end process used for job-seeker onboarding and resume-driven profile completion so the same steps can be applied to recruiter onboarding/profile flows.
- Capture backend + frontend responsibilities, field mappings, AI output contract, data persistence, and verification steps.

Scope
- This covers: resume upload → AI parse → profile merge → onboarding/profile UI population, and how to replicate/adapt that flow for recruiters.

Quick plan
1. Define a canonical AI output schema (skills, suited_roles, preferred_roles, projects, salary hints, job_title, locations).
2. Ensure backend merge logic persists canonical fields into JSONFields on the profile model and exposes safe serializer fields for backward compatibility.
3. Ensure frontend normalizes backend snake_case to camelCase and includes parsed values in onboarding/profile save payloads.
4. Add or reuse UI affordances for recruiters (mapping fields that matter to recruiter profiles).
5. Test end-to-end locally (or with mocked AI responses) and add automated tests.

Checklist (do these in order)
- [ ] Create/confirm AI parsing schema used by the resume parser service.
- [ ] Wire resume upload endpoint to call AI parser and persist parsed fields (skills, projects, suited_roles_detailed, preferred_roles, job_title, salary_min/max, locations).
- [ ] Update Django models and JSONFields for canonical storage (skills, projects, suited_job_roles_detailed, preferred_roles).
- [ ] Add migration(s) / data-backfill if legacy columns exist in environments other than local dev.
- [ ] Update DRF serializers to expose legacy-compatible fields (if needed) and to return canonical fields.
- [ ] Frontend: normalize backend response keys (snake_case -> camelCase) in onboarding/profile loaders.
- [ ] Frontend: ensure save handlers include resume-derived fields in payloads (jobTitle, desiredRoles, salaryMin/Max, projects, preferredLocations).
- [ ] Add UI affordances for recruiters where required (e.g., company-level fields, team preferences) reusing the same normalized keys when possible.
- [ ] Add tests and run manual smoke tests.

AI Output Contract (recommended canonical schema)
- Top-level object with keys:
  - job_title: string (primary parsed job title)
  - salary_min: number | null
  - salary_max: number | null
  - skills: array of objects { name: string, category?: string, proficiency?: string }
  - suited_roles: array of objects { name: string, match_percent: number }
  - preferred_roles: array of strings (derived by merge logic: suited_roles where match_percent >= 85)
  - projects: array of objects { title, link?, domain?, tech_stack?: [string], description? }
  - preferred_locations: array of strings

Notes: The AI should ideally return structured objects; however the backend must defensively normalize strings, JSON-encoded strings, or partial shapes.

Backend: Responsibilities and example steps
1. Parser/worker (`backend/fyndr_auth/utils/resume_ai.py`)
   - Define prompt and JSON schema as above and validate response shape.
   - Normalize and coerce fields, clamp match_percent (33–100) and cap list lengths (e.g., keep top 10 suited roles).
   - Derive `preferred_roles` where match_percent >= 85.
   - Persist canonical fields into the job seeker profile model fields (JSONFields): `skills`, `projects`, `suited_job_roles_detailed`, `preferred_roles`.
   - Provide heuristics to extract `projects` from text when AI returns only text.

2. Models & migrations
   - Use JSONField for flexible data: `skills = models.JSONField(default=list)`, `projects = models.JSONField(default=list)`, `suited_job_roles_detailed = models.JSONField(default=list)`.
   - When dropping legacy columns (e.g., `skills_detailed`, `suited_job_roles`), add a short data-backfill migration in production: copy legacy -> new detailed structure, then drop columns in a subsequent migration.

3. Serializers & views
   - Add serializer read-only fields or SerializerMethodFields that provide backwards-compatible shapes when older frontends still expect them (for example `suited_job_roles` returning names only).
   - In the resume parse view, call the parser, merge the parsed data into the profile (force overwrite or update heuristics), and return the normalized profile payload.
   - Always return profile data under `profile` key in the API response to match the frontend loaders.

Frontend: Responsibilities and example steps
1. Loader normalization
   - In onboarding and profile-management loaders (examples: `frontend/src/pages/job-seeker-onboarding-wizard/index.jsx`, `frontend/src/pages/profile-management/index.jsx`), convert snake_case backend fields into camelCase UI fields.
     - salary_min -> salaryMin (or salary_min kept when UI expects snake_case; but prefer camelCase for components)
     - desired_roles / preferred_roles -> desiredRoles or preferredRoles
     - projects -> projects
   - Provide safe defaults ('' or [] or null) so inputs render even when AI did not return a value.

2. Save payload
   - Ensure the high-level save handler maps UI camelCase fields back to backend snake_case shape expected by the API and includes `projects` and resume-derived fields.
   - Example: when calling PUT /auth/profile/ body { profile: { job_title, preferred_roles, salary_min, salary_max, projects } }

3. UI affordances
   - Add an "Add" button for typed-in preferred locations (so users can add arbitrary values not present in suggestion provider).
   - Projects UI: add Add / Remove / inline fields for title, link, domain, tech_stack, description. Projects are kept in `formData.projects` and passed to onUpdateProfile.

Recruiter onboarding/profile differences
- Recruiter profiles often store: company info, hiring preferences, team size, industries, recruiter-specific contact details.
- Reuse common canonical keys where applicable (e.g., `projects` can be used for portfolio of hires/case studies) but do not force job-seeker-only fields onto recruiters.
- Approach:
  1. Create recruiter-specific UI mapping that normalizes backend recruiter profile fields into camelCase for components.
  2. When adding resume-driven parsing for recruiters (if recruiters upload resumes for screening/candidate parsing), use the same AI schema but persist into a different model or nested key (e.g., `recruiter_parsed_candidate_data`) to avoid mixing recruiter profile fields with job-seeker profiles.
  3. Ensure API endpoints respect role-based permissions and consumer types.

Testing and verification
- Manual smoke test (local):
  1. Start backend server (from `backend/`):
     ```bash
     # from repo root
     cd backend
     make install-dev   # if you need to install dev deps (one-time)
     python manage.py migrate
     python manage.py runserver
     ```
  2. Start frontend dev server (from `frontend/`):
     ```bash
     cd frontend
     npm install
     npm run dev
     ```
  3. In the browser, go to Profile Management > Professional Details.
     - Upload a resume (jobseeker) and wait for AI parse to complete.
     - Confirm that parsed Job Title, Desired Roles, Salary min/max, and Projects (if any) populate the UI.
     - Add a new Project and click Save Changes — confirm it persists after reload.

- API smoke test (without UI):
  1. POST a resume file to the same upload endpoint used in the app (or call the resume parse view directly if present).
  2. Inspect the returned `profile` object JSON for keys: `skills`, `projects`, `suited_job_roles_detailed`, `preferred_roles`, `salary_min`, `salary_max`, `job_title`.

- Unit tests to add
  - Backend: tests for parser to assert canonical schema is created from a variety of AI outputs (string-lists, JSON-strings, partial objects).
  - Backend: integration test that uploads a resume and asserts profile fields are updated.
  - Frontend: tests that the onboarding loader maps snake_case to camelCase and that `ProfessionalDetailsTab` submits `projects` in the PUT payload.

Edge cases & gotchas
- AI output variance: always normalize defensively (strings, lists, JSON strings, missing fields).
- Legacy DB columns: make a data-backfill migration in production before dropping columns.
- Race conditions: if resume upload triggers an asynchronous job to parse and merge, surface progress in the UI (spinner + "Resume analyzed and processed" only after success).
- Permissions: ensure only the owner can upload/modify their profile and that recruiter flows use explicit recruiter endpoints if writing to recruiter-only resources.

Small contract (for implementers)
- Inputs: resume file, authenticated user (access token)
- Outputs: profile JSON updated with keys described in AI Output Contract
- Error modes: AI failure (server returns error), merge conflicts, invalid uploaded file types
- Success criteria: UI fields for jobTitle, desiredRoles, salaryMin/Max, projects, and skills are populated and persisted after clicking Save Changes.

Rollback / recovery
- If a bad merge occurs, provide an admin or migration that can restore profile from a backup or previous DB snapshot.
- Keep an audit log of automated merges (timestamp + diff) to ease reversal.

Next steps & recommendations
- Add a small mock for the AI parser used during local development so you can run E2E tests without a live Gemini key.
- Add automated tests (backend + frontend) to cover the most critical happy path and one or two edge cases (empty/partial AI output, string vs object skills).
- If production still has legacy columns, add and run a copy-back migration prior to dropping columns.

Contact
- For detailed implementation questions about the parser code, see `backend/fyndr_auth/utils/resume_ai.py`.
- For frontend mapping examples, see `frontend/src/pages/job-seeker-onboarding-wizard/index.jsx` and `frontend/src/pages/profile-management/index.jsx`.

Completion
- This document is intended as a working checklist and reference — copy/adapt it into your release runbook when you deploy the recruiter onboarding flow.
