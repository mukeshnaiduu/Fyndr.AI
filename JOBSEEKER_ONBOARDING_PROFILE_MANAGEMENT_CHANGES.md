# Jobseeker Onboarding + Profile Management: UI and Data Changes

This document summarizes the recent frontend changes for Jobseekers across Onboarding and Profile Management, and provides a short porting guide for Recruiter/Company flows.

## Summary
- Centralized industries list in a shared constant and applied it in both Onboarding and Profile Management.
- Desired Job Titles in Profile Management now include a dedicated Add button in addition to typeahead selection.
- Jobseeker Industries in Profile Management are rendered as themed checkboxes (multi-select), aligned with the app’s UI system.
- Expected Salary uses explicit Min/Max (INR) fields in both Onboarding and Profile Management.
- Navbar role display fixed to show the actual role (e.g., Job Seeker), normalizing role variants.
- Profile Management page width increased for better layout density.

---

## Changes by Area

### 1) Shared constants and module resolution
- Added `frontend/src/constants/industries.js` exporting `INDUSTRY_OPTIONS` (value/label pairs).
- Updated module aliases so `constants/industries` resolves correctly:
  - `frontend/vite.config.mjs`: added alias `'constants': '/src/constants'`.
  - `frontend/jsconfig.json`: added path mapping `"constants/*": ["./constants/*"]`.

Why: Keep a single source of truth for industries across screens; remove hardcoded duplication.

### 2) Jobseeker Onboarding (Career Preferences)
- File: `frontend/src/pages/job-seeker-onboarding-wizard/components/CareerPreferencesStep.jsx`
  - Replaced local industry list with `INDUSTRY_OPTIONS` from `constants/industries`.
  - Industries are rendered as a checkbox grid using the shared `Checkbox` component.
  - Desired Job Titles remain typeahead via `RoleInput` with chips.
  - Locations remain typeahead via `LocationInput` with chips.
  - Salary uses Min/Max numeric fields (INR), with simple `min < max` validation.

Data shape (unchanged intent):
- `desiredRoles: string[]`
- `industries: string[]` (values match `INDUSTRY_OPTIONS.value`)
- `salaryMin: number | ''`, `salaryMax: number | ''`

### 3) Jobseeker Profile Management
- Files:
  - `frontend/src/pages/profile-management/components/ProfessionalDetailsTab.jsx`
  - `frontend/src/pages/profile-management/index.jsx`

UI/UX updates:
- Desired Job Titles:
  - Kept `RoleInput` typeahead and added an explicit Add button to commit the current input to chips.
- Industries:
  - Switched from typeahead to a checkbox grid powered by `INDUSTRY_OPTIONS`.
  - Uses the shared `Checkbox` for app-theme aligned styles (selected: `border-primary bg-primary/5 text-primary`; hover matches theme).
- Expected Salary:
  - Replaced band UI with explicit Min/Max numeric fields (INR) to match onboarding.
- Layout:
  - Profile Management container widened to `max-w-7xl` for more content width.

Data mapping and normalization (in `index.jsx`):
- Load:
  - `desiredRoles` ← `profile.desired_roles` or `profile.preferred_roles`.
  - `industries` ← `profile.industries` (array) or `[profile.industry]` fallback.
  - `salary_min`, `salary_max`, `salary_currency` (INR default).
- Save (PUT `/auth/profile/` → `{ profile: payload }`):
  - `preferred_roles` ← `desiredRoles`.
  - `industries` ← `industries` (array of values).
  - `salary_min`, `salary_max`, `salary_currency`.
  - Recruiter-only mapping is preserved: `industry` (UI) → `primary_industry` (API).
- Notes:
  - Do not send file URLs (avatar/resume) in PUT; uploads are handled by the secure upload endpoint.

### 4) Navbar role display fix
- File: `frontend/src/components/ui/RoleBasedNavbar.jsx`
  - Normalizes role variants (e.g., `jobseeker` → `job_seeker`).
  - Uses normalized role for role-based navigation and for role label/color rendering.
  - Prevents fallback to generic "User" when camel/snake roles differ.

---

## Minimal “contract” (Jobseeker profile fields)
- Inputs:
  - desiredRoles: string[]
  - industries: string[] (values from `INDUSTRY_OPTIONS.value`)
  - salary_min: number | null, salary_max: number | null, salary_currency: 'INR'
- Save payload (subset):
  - `preferred_roles`, `industries`, `salary_min`, `salary_max`, `salary_currency`
- Error modes:
  - Validation client-side for roles required; `min < max` for salary.

## Edge cases handled
- Role variant differences (`jobseeker` vs `job_seeker`) when rendering navbar.
- Empty industries list: safe defaults (empty array) without crashes.
- Avoid sending upload URLs on PUT.

---

## Porting guide (Recruiter/Company)

1) Industries
- Reuse `INDUSTRY_OPTIONS` for display consistency.
- Recruiter: keep single `Primary Industry` (map to `primary_industry` on save). Use a radio/select or a single-select checkbox list.
- Company: mirror its schema (company profile) and map accordingly.

2) Desired Job Titles
- If applicable for the role, you can mirror the “Add” button pattern alongside `RoleInput` typeahead.

3) Salary
- Choose Min/Max (INR) if parity with jobseeker is desired, or retain role-specific logic.

4) Save/Load mapping
- Recruiter: ensure `industry` (UI) → `primary_industry` (API). Preserve the principle of not PUTting file URLs.
- Company: confirm field names and align mapping with its serializer.

5) Theming and layout
- Use `Checkbox` and themed container classes for option groups.
- Consider widening containers (e.g., `max-w-7xl`) where dense forms benefit.

---

## Files changed (primary)
- `frontend/src/constants/industries.js` (new): shared industries list.
- `frontend/vite.config.mjs`: alias `'constants'`.
- `frontend/jsconfig.json`: path mapping for constants.
- `frontend/src/pages/job-seeker-onboarding-wizard/components/CareerPreferencesStep.jsx`: industries from constants.
- `frontend/src/pages/profile-management/components/ProfessionalDetailsTab.jsx`: Add button for Desired Job Titles; industries as themed checkboxes; salary min/max.
- `frontend/src/pages/profile-management/index.jsx`: load/save normalization for roles, industries, salary; widened layout.
- `frontend/src/components/ui/RoleBasedNavbar.jsx`: role normalization for labels/navigation.

---

## Quick QA checklist
- Onboarding
  - [ ] Select multiple industries via checkboxes; chips and validation behave.
  - [ ] Add desired roles via typeahead; chips update; error clears.
  - [ ] Salary min/max validation: `min < max`.
- Profile Management (Jobseeker)
  - [ ] Add desired role using the Add button (and via suggestion); chip appears/removes.
  - [ ] Toggle industries via checkboxes; save and refresh persists.
  - [ ] Salary min/max persist on save; completion meter updates.
  - [ ] Navbar shows correct role label/color.

If you want, I can replicate the same patterns for Recruiter/Company next.
