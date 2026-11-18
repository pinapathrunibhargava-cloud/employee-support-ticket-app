# AGENTS.md — Employee Support Ticket Management System

Two independent projects; there is no root build, test, lint, formatter, or task-runner config. Run commands from inside `backend/` or `frontend/`.

## Commands
- Backend (`backend/`): `mvn spring-boot:run` (port 8080), `mvn clean package`. There is **no `mvnw` wrapper** — use installed Maven. No test sources/dependencies exist; verification is manual (curl or browser), not a test suite.
- Frontend (`frontend/`): `npm run dev` (port 5173), `npm run build` (= `tsc -b && vite build`). No test/lint/format scripts. `node_modules/` is already installed.
- In PowerShell here `npm.ps1` is blocked by execution policy (`npm : ... cannot be loaded`); use `npm.cmd` / `npx.cmd`.

## Backend gotchas
- Requires local MySQL on 3306. `application.properties` reads `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` with built-in defaults (DB `employee_support_ticket_db`, auto-created, `ddl-auto=update`).
- `DatabaseSeeder` inserts the 5 fixed demo tickets **only when the `tickets` table is empty** — seed edits won't appear until you clear it.
- Every `/api/**` request except `OPTIONS` must send `X-User-Id` + `X-User-Role`; `DemoUserInterceptor` returns 400 for missing/unknown/mismatched values. Only `alice.employee` / `charlie.employee` = `EMPLOYEE` and `bob.support` = `SUPPORT_STAFF` are recognized. CORS allows only `http://localhost:5173`.
- Statuses are `OPEN`/`IN_PROGRESS`/`RESOLVED`/`CLOSED` in Java but `"Open"`/`"In Progress"`/`"Resolved"`/`"Closed"` in JSON and MySQL (`@JsonValue`/`@JsonCreator` + `StatusConverter`); both forms are accepted on input. Transitions are strictly sequential; closed tickets are read-only except for comments.
- Authorization/business rules live in `TicketService`, not the controllers or interceptor (the interceptor only validates identity shape).

## Frontend gotchas
- No router. `App.tsx` chooses `list|detail|create|edit` from `?view=` / `?ticket=`; `PersonaContext.tsx` reads `?persona=` on load — useful for deep-linking during manual checks.
- API base URL is hardcoded to `http://localhost:8080` in `api/client.ts` (no env var). Its request interceptor attaches the two demo headers.
- The sequential status logic is duplicated: `getNextStatus()` in `types/ticket.ts` and `Status.canTransitionTo()` in the backend — change both.
- Actual files: `src/main.tsx` → `App.tsx`, with `api/client.ts`, `api/ticketApi.ts`, `context/PersonaContext.tsx`, `types/ticket.ts`, and `components/Ticket*.tsx`.

## Docs & repo state
- `specification.md` and `product-prompt.md` are the authoritative requirements. `implementation-plan.md` has **stale file paths** (e.g. `UserContext.tsx`, `services/api.ts`, `TicketDetails.tsx`) that don't exist — trust the code over the plan.
- Git repo has no commits and no `.gitignore`; everything is untracked. `backend/target/`, `frontend/dist/`, `frontend/node_modules/`, `frontend/tsconfig.tsbuildinfo` are present — don't `git add` them.
- No README, `opencode.json`, CI, or pre-commit config; `.cursor/` is empty.
