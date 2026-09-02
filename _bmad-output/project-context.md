---
project_name: 'plims'
user_name: 'Jake'
date: '2026-05-16'
sections_completed: ['technology_stack', 'version_compatibility', 'language_specific', 'framework_specific', 'testing', 'code_quality', 'workflow', 'critical_dont_miss']
status: 'complete'
rule_count: 85
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

### Backend (`/backend`)
- **Runtime:** Node.js, served via Express **4.18.2**
- **Language:** TypeScript **5.1.6**, `target: es2016`, `module: commonjs`, `strict: true`
- **Database:** PostgreSQL **15-alpine**, queried via **Knex 2.5.1** (query builder + migrations + seeds)
- **Driver:** `pg` 8.11.3
- **Dev runner:** `ts-node-dev` 2.0 (`npm run dev`)
- **Other:** `cors` 2.8.5, `dotenv` 16.3.1
- **No test framework** is configured
- **No linter** is configured on backend

### Frontend (`/frontend`)
- **Framework:** React **19.2** + ReactDOM 19.2 (`type: module` / ESM)
- **Language:** TypeScript **~5.9.3**, `target: ES2022`, `module: ESNext`, `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`, `verbatimModuleSyntax: true`, `erasableSyntaxOnly: true`
- **Bundler:** Vite **7.2.4** (`@vitejs/plugin-react` 5.1)
- **Styling:** Tailwind CSS **3.4.17** + PostCSS 8.5 + Autoprefixer 10.4
- **UI primitives:** Shadcn/UI on top of Radix UI (`@radix-ui/react-dialog`, `react-popover`, `react-scroll-area`, `react-tabs`, `react-slot`)
- **Helpers:** `clsx`, `tailwind-merge`, `class-variance-authority`
- **Dates:** `date-fns` **4.1**
- **Charts:** `recharts` **3.7**
- **Icons:** `lucide-react`
- **Linter:** ESLint 9 (flat config) with `typescript-eslint`, `react-hooks`, `react-refresh`
- **Path alias:** `@/*` → `./src/*` (configured in both `tsconfig.app.json` and `vite.config.ts`)
- **No test framework** is configured

### Infra
- `docker-compose.yml` defines three services on `plims_network`:
  - **db** (postgres:15-alpine) → port 5432, user/pass/db = `plims_user`/`plims_password`/`plims_db`
  - **api** (./backend) → port 3000, runs `npm run dev:migrate` (migrate then dev)
  - **web** (./frontend) → port 5173, env `VITE_API_URL=http://localhost:3000`

---

## Critical Implementation Rules

### Version & Compatibility Constraints

**Scope tags — every rule applies to exactly one package. Determine the package from the file path (`backend/**` or `frontend/**`) and ignore rules tagged for the other package.**

1. **[backend]** Backend is **CommonJS, target `es2016`**. Do NOT use top-level `await`, ESM-only packages, or `import.meta`. `tsc` emits `require('./foo')` regardless of source — never append `.js` extensions to imports (NodeNext-style); they will break.

2. **[frontend]** `verbatimModuleSyntax: true` requires **separate** `import type { X }` and `import { y }` statements. Mixed forms like `import { type Foo, bar }` typecheck but emit the import at runtime — use only when the whole import is value-bearing, otherwise split into two statements.

3. **[frontend]** `erasableSyntaxOnly: true` forbids TS **enums**, **namespaces**, and **constructor parameter properties**. Use `const` objects + union types or plain class fields instead.

4. **[frontend]** `noUnusedLocals` + `noUnusedParameters` are on — unused symbols fail the build. Prefix with `_` to suppress (`_unusedArg`).

5. **[both]** TS versions are **not aligned** (backend 5.1 vs frontend 5.9) and `package.json` files are independent. Don't assume a hoisted/root TS. Type-level features from TS 5.9 (e.g., `const` type parameters, newer `satisfies` narrowing) are NOT available in backend code.

6. **[frontend]** React 19 — prefer **`function Component(props: Props)`** declarations. `React.FC` is permitted but in React 19 it no longer implicitly includes `children`; if you use it, declare `children` explicitly in `Props` or `<Component>...</Component>` will fail to typecheck. Prefer **ref-as-prop** over the legacy `forwardRef` API.

7. **[backend]** Knex 2.5 — `.returning('*')` is supported natively on Postgres. Stay PG-specific; do not write dialect-portable code.

8. **[backend]** PostgreSQL 15 — `gen_random_uuid()` is built-in. Do NOT add `uuid-ossp` extension or any `uuid` npm package for PK generation.

9. **[both]** **Cross-package boundaries are hard.** The two packages are independent:
   - **No shared types, shared runtime code, or shared `tsconfig` path alias.** Don't create a `shared/` folder or workspace reference. There is no workspace tooling configured (no pnpm/yarn workspaces, no project references).
   - **API contracts cross the boundary as JSON over HTTP**; types are duplicated on each side by hand.
   - **Path aliases are frontend-only.** `@/*` → `./src/*` resolves only in `frontend/` (configured in both `tsconfig.app.json` and `vite.config.ts`). Backend has no alias and uses **relative imports only** (e.g., `import { LaborMatrix } from '../logic/LaborMatrix'`).
   - **Never** port a `@/*` import into `backend/src/**` — it may typecheck if an agent adds `paths` to `backend/tsconfig.json`, but will crash at runtime (`Cannot find module '@/...'`) because no alias resolver is wired (no `tsconfig-paths/register`, no `module-alias`).
   - **Never** add `"type": "module"` to `backend/package.json` — Knex 2.5's CJS default export will break, and existing `require`-style boot in `backend/src/index.ts` will need a rewrite that isn't currently designed.

### Language-Specific Rules

**TypeScript-wide:**

1. **[both]** **`catch` clauses bind `unknown`, not `any`.** Strict mode is on. Narrow with `instanceof Error` before reading `err.message`. Prefer `res.status(500).json({ error: err instanceof Error ? err.message : 'unknown error' })` over `{ error: err }` (which serializes poorly).

2. **[backend]** **Knex aggregate columns return strings on Postgres.** `.count('id as count').first()` resolves to `{ count: string }`, not `number`. Always coerce: `Number(row?.count ?? 0)`. The codebase mixes `Number(...)` (`LaborMatrix.ts`) and `parseInt(... as string)` (`Feasibility.ts`); **prefer `Number(row?.count ?? 0)`** going forward.

3. **[backend]** **`req.body` is untyped (`any`)** — no validation layer (no `zod`, no `express-validator`). Treat `req.body` as untrusted. Destructure named fields explicitly; do NOT spread `req.body` into a DB insert. (`POST /events` currently does this — flag if you touch it.)

4. **[both]** **Dates are stored and exchanged as `YYYY-MM-DD` strings, not `Date` objects.** Pattern: `new Date().toISOString().split('T')[0]`. Knex `date` columns return strings. Do NOT pass `Date` objects to Knex filters against `date` columns — pass the formatted string. On the frontend, prefer `date-fns` (`format(d, 'yyyy-MM-dd')`).

5. **[both]** **Prefer `??` over `||` when defaulting numeric or boolean values.** Existing code uses `|| 0` which collapses legitimate `0` values. For counts, totals, and IDs, use `?? 0`.

**Backend-specific:**

6. **[backend]** **Async route handlers don't auto-catch.** Express 4 silently swallows rejected promises. Every `async` handler in `routes/api.ts` MUST wrap its body in `try/catch` and respond in the `catch`. No global error middleware exists; `express-async-errors` is not installed.

7. **[backend]** **Use `import type` for Knex types** (e.g., `import type { Knex } from 'knex'`). Migrations use `(knex: any)` to sidestep typing — this is the existing convention; do not "improve" it without typing all migrations.

**Frontend-specific:**

8. **[frontend]** **Prefer `interface` for component prop shapes** (existing convention — see `KPICardProps`, `DashboardStats` in `Dashboard.tsx`). Use `type` for unions/intersections/utility-derived shapes.

9. **[frontend]** **Don't import `React` for JSX.** Vite + React 19 + `jsx: "react-jsx"` makes the namespace import unnecessary. Import only the specific named exports you use (`useState`, `useEffect`, `type ReactNode`). `Dashboard.tsx` still does — that's legacy, don't propagate.

10. **[frontend]** **No data-fetching library is installed.** Components use raw `fetch` directly. Do NOT add `axios`, `react-query`, `swr`, etc., without explicit approval.

11. **[frontend]** **API base URL is hardcoded** (`http://localhost:3000`); `VITE_API_URL` is defined in `docker-compose.yml` but not consumed in code. When touching a `fetch` call, prefer reading `import.meta.env.VITE_API_URL` with a fallback. Do NOT introduce a global API client class unsolicited.

### Framework-Specific Rules

**Backend — Express + Knex:**

1. **[backend]** **The `db` instance is a singleton imported from `backend/src/index.ts`.** Every consumer does `import { db } from '../index';`. Do NOT instantiate a second Knex client; do NOT re-import `knexfile` at call sites. `index.ts` initializes `db` **before** importing routes to avoid a circular import — preserve this order.

2. **[backend]** **All routes live in `backend/src/routes/api.ts`**, mounted at `/api`. The `controllers/` folder exists but is **intentionally empty** — do NOT split routes into per-resource controllers without explicit approval. Add new endpoints grouped under existing `// --- SECTION ---` banners (`EVENTS`, `PERSONNEL`, `INVENTORY`).

3. **[backend]** **Business logic lives in `backend/src/logic/` as classes with `static` methods.** Existing: `LaborMatrix`, `Feasibility`, `Inventory`. Do NOT use instance methods, free functions, or namespaces. Pattern: `export class FooLogic { static async doThing(...) { ... } }`.

4. **[backend]** **Knex upserts use `.onConflict([...keys]).merge()`** (see `POST /personnel/availability`). Use for any unique-pair update. Do NOT roll a `SELECT then INSERT/UPDATE` two-step.

5. **[backend]** **Migrations are timestamped, `YYYYMMDDHHMMSS_description.ts`, in `backend/src/migrations/`.** Generate with `npm run migrate:make -- <name>` — never hand-author filenames. Migrations use `(knex: any)` (existing convention). Both `up` and `down` must be implemented.

6. **[backend]** **Postgres enum columns require a migration to change values.** Precedent: `20260130210350_fix_parachute_status_constraint.ts`. Do NOT add a new enum value in TypeScript only — Postgres will reject the insert. Update the enum constraint in a new migration first.

7. **[backend]** **CORS is permissive (`app.use(cors())` with no options).** Do NOT tighten without asking — there is no auth layer and frontend dev relies on it.

**Frontend — React 19:**

8. **[frontend]** **No router is installed.** View switching happens via `useState` in `App.tsx` with a string union. To add a top-level view: extend the union, add a `<Button>` in the navbar, add a render case in `<main>`. Do NOT add `react-router` without approval.

9. **[frontend]** **No global state management is installed.** Per-component `useState` + `useEffect`-with-`fetch` is the pattern. If you find yourself needing cross-component state, stop and ask.

10. **[frontend]** **Feature views go in `frontend/src/components/` with PascalCase filenames** (`Dashboard.tsx`, `PersonnelGrid.tsx`). **Shadcn UI primitives go in `frontend/src/components/ui/` with lowercase filenames** (`button.tsx`, `card.tsx`). Do NOT mix.

11. **[frontend]** **Always compose Tailwind class strings with `cn()`** from `@/lib/utils` (wraps `clsx` + `tailwind-merge`). Do NOT concatenate class strings with `+` or template literals when conditionals are involved.

12. **[frontend]** **Tailwind theme uses CSS-variable-driven Shadcn tokens** — use semantic names (`bg-background`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `border`) from `tailwind.config.js`. Do NOT use raw palette names (`bg-slate-900`, `text-gray-500`); they bypass the theme.

13. **[frontend]** **`dark` mode is class-based** (`darkMode: ["class"]`). No theme toggle UI exists; if you write `dark:` utilities, don't assume a switch.

14. **[frontend]** **Icons from `lucide-react`; dialogs/popovers/tabs/scroll-area from Radix via Shadcn; charts from `recharts`.** Do NOT add new UI deps (Heroicons, headless-ui, react-icons) — match what's installed.

### Testing & Verification Rules

1. **[both]** While no test runner is installed (no `scripts.test`, no `vitest`/`jest` in devDeps), do NOT scaffold `*.test.ts` / `*.spec.ts` files or import test libraries — they will not execute and will mislead readers.

2. **[both]** If a task implies tests, surface the framework choice as a question rather than silently scaffolding. In the meantime, implement the feature and document the verification gap (what scenarios you'd cover if a runner existed) in your hand-off.

3. **[both]** Backend has no linter or formatter (no ESLint, no Prettier config). Match the existing 4-space indent and Knex/Express idioms manually. Frontend has `npm run lint` (ESLint 9 flat) — run it after non-trivial changes. Do NOT add lint/formatter tooling to backend unsolicited.

4. **[both]** There is no CI. **You are the CI** — run the touched package's `npm run build` before declaring a change complete. Don't appeal to a build step that doesn't happen automatically.

5. **[both]** Typecheck is the **cheapest** signal, NOT a safety net. Run `npm run build` in the touched package. Typecheck does NOT catch: Knex column typos (e.g., `.where('first_name', …)` against a `firstName` column), Postgres enum constraint violations, broken migration `down` blocks, or frontend↔backend URL drift. Those require running the code against a live DB.

6. **[backend]** Backend manual verification: `docker-compose up` (canonical dev environment), then `curl localhost:3000/health` (expect `{ status: 'ok', db: 'connected' }`), then `curl` the affected endpoint. State the expected response shape and the observed response in your hand-off. There is no integration harness.

7. **[frontend]** Frontend manual verification: `npm run build` (catches errors HMR masks), then `npm run dev` → `http://localhost:5173` → exercise the affected view. State the specific behavior you verified (e.g., "KPI cards populate from `/api/dashboard/stats`"), not just "the view loads."

8. **[backend]** Schema-touching changes must round-trip — for any new or modified migration, run `npm run migrate:latest && npm run migrate:rollback && npm run migrate:latest` against a clean dev DB. A migration with a broken `down` is broken.

### Code Quality & Style Rules

**Naming conventions:**

1. **[backend]** **Database columns are `snake_case`** (`user_id`, `jump_date`, `draw_date`, `quantity_required`, `last_pack_date`, `pack_count`, `surge_mode`, `is_active`, `created_at`, `updated_at`). **TypeScript variables in app code are `camelCase`** (`eventId`, `drawDate`). **There is NO automatic conversion** (no Objection.js, no Knex `wrapIdentifier` configured). Knex returns rows with `snake_case` keys verbatim — destructure them in the same case (`const { draw_date, quantity_required } = event`) or read `.draw_date` directly. Existing code does this (`event.draw_date` in `Feasibility.ts`); preserve the convention.

2. **[backend]** **Primary keys: `uuid` for all tables except `parachutes` (string `serial_number` PK).** Migrations use `table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"))`. Foreign keys use `table.uuid("col").references("id").inTable("…")`.

3. **[backend]** **Timestamps via `table.timestamps(true, true)`** — auto-managed `created_at` / `updated_at`. Do NOT add manual `created_at: new Date()` in inserts.

4. **[backend]** **Logic class files are `PascalCase.ts`** (`LaborMatrix.ts`, `Feasibility.ts`, `Inventory.ts`). **Route files are `lowercase.ts`** (`api.ts`). **Config files: lowercase** (`knexfile.ts`). **Migration files: `YYYYMMDDHHMMSS_snake_description.ts`** (Knex-generated).

5. **[frontend]** **Feature view components: `PascalCase.tsx`** (`Dashboard.tsx`, `PersonnelGrid.tsx`, `CalendarView.tsx`, `InventoryView.tsx`). **Shadcn UI primitives: `lowercase.tsx`** (`button.tsx`, `card.tsx`, `dialog.tsx`). **Utility files: `lowercase.ts`** (`utils.ts`). Do NOT mix.

6. **[both]** **API error response shape is `{ error: string }`** with appropriate HTTP status (usually 500 for server errors, 404 for not-found, 400 for bad-request). Match this shape on new endpoints; do NOT introduce `{ message }`, `{ err }`, or wrapped envelopes.

**Formatting (no enforcement layer — observe by reading):**

7. **[backend]** **Backend is consistently 4-space indented**, single quotes for strings, semicolons required. Match this style — there is no Prettier to auto-fix.

8. **[frontend]** **Frontend indentation is mixed in the existing codebase** (`App.tsx` is 2-space, `Dashboard.tsx` is 4-space). **Match the file you are editing**; do NOT reformat an existing file's indentation as a side-effect. New files should default to 2-space.

9. **[both]** Single quotes for strings, double quotes only inside JSX attributes. Semicolons everywhere.

**Organization:**

10. **[backend]** **Folder layout:** `src/migrations/`, `src/seeds/`, `src/logic/` (static classes), `src/routes/api.ts` (monolith), `src/config/` (empty — do not populate without approval), `src/controllers/` (empty — intentional). Do NOT add new top-level folders.

11. **[frontend]** **Folder layout:** `src/components/` (feature views), `src/components/ui/` (shadcn primitives), `src/lib/` (utilities like `cn()`), `src/assets/`. Do NOT add `src/pages/`, `src/hooks/`, `src/services/`, `src/api/`, `src/store/` — none exist; flag if you think you need one.

**Comments & docs:**

12. **[both]** **Default to NO comments.** The existing code is sparse — only `Feasibility.ts` has explanatory `// Check 1: …` markers because the constraint logic is genuinely non-obvious. Comment only when the *why* would surprise a reader (a hidden invariant, a Postgres-specific quirk, a workaround). Don't narrate what the code does.

13. **[backend]** **Route section banners use `// --- SECTION ---`** in `routes/api.ts` (e.g., `// --- EVENTS ---`, `// --- PERSONNEL ---`, `// --- INVENTORY ---`). When adding a new resource group, follow this banner format.

14. **[both]** **Logging:** `console.log` for startup messages, `console.error` inside `catch` blocks (existing pattern). No structured logger (`pino`, `winston`) is installed — don't add one.

### Development Workflow Rules

**Repository state:**

1. **[both]** **The project is not yet a git repository** (no `.git/`). Until git is initialized, do NOT reference branches, commits, or PR workflows in any output. Do NOT run `git init` unsolicited.

2. **[both]** **No commit-message convention has been established.** When asked to draft a commit message after git is initialized, default to **Conventional Commits** (`feat:`, `fix:`, `chore:`, `refactor:`) unless Jake overrides.

3. **[both]** **No PR template, no CODEOWNERS, no `.github/` directory.** Do not assume any team review process exists.

**Dev environment:**

4. **[both]** **`docker-compose up` is the canonical full-stack dev environment.** It starts Postgres 15 (`db`), the Express API (`api`, runs `npm run dev:migrate`), and the Vite dev server (`web`). API container auto-runs migrations on boot.

5. **[both]** **Service ports:** db `5432`, api `3000`, web `5173`. Default DB credentials (dev only): user `plims_user`, pass `plims_password`, db `plims_db` — hardcoded in `docker-compose.yml` and `knexfile.ts` defaults. Do NOT rotate them unsolicited.

6. **[both]** **Local-without-Docker is also viable.** Run `npm run dev` in `backend/` (needs `DB_HOST=localhost` and a running Postgres) and `npm run dev` in `frontend/` independently.

7. **[backend]** **Environment variables read via `dotenv`** in `backend/src/index.ts` and `knexfile.ts`. Recognized: `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`. **No `.env.example` file exists** — when adding a new env var, create the convention as you go.

8. **[frontend]** **Frontend env vars must be prefixed `VITE_`** to be exposed to the bundle. `VITE_API_URL` is declared in `docker-compose.yml` but not consumed in code today. Access via `import.meta.env.VITE_<NAME>`.

**Migrations & seeds:**

9. **[backend]** **Make new migrations with `npm run migrate:make -- <name>`** (TypeScript flag built into the script). NEVER create migration files by hand — `knex` generates the correctly-prefixed timestamp.

10. **[backend]** **Seeds live in `src/seeds/`** with numeric-prefix ordering (`01_initial_data.ts`). Run with `npm run seed:run`. Current seed is dev-mock-data; do NOT assume production data exists in seeds.

**Build & deploy:**

11. **[both]** **Build commands:** Backend `npm run build` (→ `dist/`). Frontend `npm run build` (→ `dist/`). Backend production start: `npm run start` (runs `node dist/index.js`).

12. **[both]** **There is no deployment configuration** (no Vercel/Netlify config, no GitHub Actions, no Fly/Render manifests, no Kubernetes). Dockerfiles target local dev. If asked about deployment, flag that no path is defined.

### Critical Don't-Miss Rules

**Domain invariants (anti-patterns specific to plims):**

1. **[backend]** **`parachutes.status` and `parachutes.process_stage` are TWO INDEPENDENT axes — do NOT conflate them.**
   - `status`: `ready | expired | maintenance | in_process` — *lifecycle* of the chute.
   - `process_stage`: `unpacked | packed | initial_inspected | final_inspected` — *current step in the inspection workflow*.
   A chute can be `status: in_process` AND `process_stage: initial_inspected` simultaneously. The inspection state machine (Packed → Initial Inspection → Final Inspection → Ready for Issue) lives on `process_stage`, NOT `status`.

2. **[backend]** **The 180-day repack rule is domain law.** `Inventory.getExpirationStatus()` computes `expiration_date = last_pack_date + 180 days` and marks `days_until_expiration <= 0` as `expired`. If you change this constant, you change the regulation the app encodes — confirm with Jake before touching `180`.

3. **[backend]** **Daily pack cap = 12 (or 15 in `surge_mode`).** Encoded in `LaborMatrix.PACK_LIMIT = 12` and `Feasibility.checkEventFeasibility` (`event.surge_mode ? 15 : 12`). These two paths MUST stay in sync — if you change the limit, change both.

4. **[backend]** **`LaborMatrix.getRangeCapacity` excludes weekends** (`day === 0 || day === 6` skipped). Hidden domain assumption: riggers work M–F. An event with a weekend `draw_date` gets `drawDateCapacity = 0` and will be flagged unfeasible. Do NOT "fix" without confirming operational reality with Jake.

5. **[backend]** **Same-day demand aggregation matters in feasibility.** `Feasibility.checkEventFeasibility` sums `quantity_required` across ALL events sharing a `draw_date`, not just the queried event. New event-creation paths still need to respect this.

6. **[backend]** **`parachutes.category` enum is `main | reserve`** (default `main`). Reserve parachutes have different operational rules in real-world Army Rigger doctrine but the codebase **does not currently differentiate them in capacity math**. Do NOT introduce reserve-specific feasibility logic without explicit approval.

**Data integrity & concurrency:**

7. **[backend]** **`daily_logs.pack_count` is currently never written by any route.** The table exists for the 12-per-day cap, but no endpoint increments it. Feasibility checks labor *capacity*, NOT actual production logged. If you add a "log pack" endpoint, use `.onConflict(['user_id', 'date']).merge()` with an atomic `pack_count = pack_count + 1` increment (Knex raw fragment) — do NOT read-then-write.

8. **[backend]** **Auto-generated parachute serials in `POST /parachutes/bulk` use `Date.now()` + index**, which is **not collision-safe across concurrent requests**. Bulk inserts fired within the same millisecond will produce duplicate serials and PK conflict. If you touch this endpoint, switch to UUID/sequence-based serials, OR document the single-caller constraint.

9. **[backend]** **Postgres enum constraints are not in TypeScript types.** Inserting `status: 'foo'` typechecks (Knex `insert(any)` is untyped) but fails at runtime with a constraint error. When adding a new enum value, add a migration that updates the constraint AND the corresponding TS union.

**Security gotchas:**

10. **[both]** **There is NO authentication, NO authorization, NO sessions.** Every endpoint is public. CORS is wide open. Default DB credentials are committed to the repo. **This is a prototype-grade security posture.** Do NOT add auth-aware code paths that assume `req.user` exists. Do NOT ship as-is — flag it.

11. **[backend]** **`req.body` is forwarded to Knex inserts in some places** (e.g., `POST /events` does `db('events').insert(req.body)`). Knex parameterizes values so this is not SQL-injection-vulnerable, BUT a caller can inject unexpected columns (set `created_at` to a past date, set `id` to a chosen UUID). When touching these endpoints, destructure named fields explicitly.

12. **[backend]** **`/api/parachutes/bulk` accepts up to 1000 inserts per request.** No rate limit, no auth — DoS-shaped attack surface. Do not raise the cap without adding back-pressure.

**Performance gotchas:**

13. **[backend]** **`LaborMatrix.getRangeCapacity` runs N queries per date in the range** (one `getDailyCapacity` call per day). For a 2-year forecast that's ~520 sequential DB roundtrips. Do NOT call it inside a loop or per-event — it will become the hot path. If you need range capacity across many events, batch or memoize.

14. **[backend]** **`Inventory.getExpirationStatus` selects ALL parachutes and maps in JS.** Fine at MVP-scale, won't scale beyond ~10k chutes. Don't filter in JS when you can `.where()` in SQL — already does `where('category', ...)` if provided; do the same for any new filter.

15. **[backend]** **No DB indexes beyond PKs and the existing unique constraints** (`(user_id, date)` on availability and daily_logs). Queries on `parachutes.status`, `events.draw_date`, `events.jump_date` are seq-scans. Add an index migration when filtering a growing column.

**Frontend-specific gotchas:**

16. **[frontend]** **Per-component `fetch` with no abort/cleanup.** Components fire `fetch` in `useEffect` without `AbortController` — fast view-switching can resolve stale requests into unmounted components (React 19 StrictMode dev-mode will warn). When editing these, add cleanup.

17. **[frontend]** **No loading-skeleton or error-state component.** Pattern is `if (loading) return <div>Loading...</div>` (see `Dashboard.tsx`). Match it. Do NOT introduce `Suspense`, `<ErrorBoundary>`, or a global toast system unsolicited.

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code in `plims`.
- Every rule is tagged `[backend]`, `[frontend]`, or `[both]` — determine the package from the file path you are editing and ignore rules for the other package.
- When in doubt, prefer the more restrictive option and flag the question rather than guessing.
- The "Critical Don't-Miss Rules" section encodes domain law (180-day repack, 12-pack cap, status vs process_stage axes). Do not modify these constants without explicit approval.
- If you discover a new convention worth capturing, propose adding it to this file.

**For Humans:**

- Keep this file lean and focused — every rule should prevent a specific mistake, not state obvious facts.
- Update when technology stack changes, when a new convention is adopted, or when an agent makes the same mistake twice.
- Review when adding a major feature (auth, tests, CI, deployment) — many "missing" rules will need to flip to "present" rules.
- Remove rules that have become obvious (e.g., once everyone knows about the migration round-trip habit).

Last Updated: 2026-05-16
