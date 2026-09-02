---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete', 'step-e-01-discovery', 'step-e-02-review', 'step-e-03-edit']
status: 'complete'
completedDate: '2026-05-16'
lastEdited: '2026-05-19'
editHistory:
  - date: '2026-05-19'
    revision: 'r2'
    validationReport: '_bmad-output/planning-artifacts/validation-report-2026-05-19.md'
    changes: 'Validation-driven iteration: added Acknowledged Weaknesses section (moved NFR-S6 there); moved NFR-O5 backup statement to Product Scope → Vision; renumbered NFR-O6 → NFR-O5; tightened FR5/FR6/FR8/FR13/FR14/FR22/FR24/FR28 with explicit bounds and constants; added temporal qualifier to NFR-R1 (grandfather pre-Increment-2 ready chutes); de-leaked NFR-S5 (removed app.use(cors())); trimmed NFR-O1 discipline guidance; rewrote Measurable Outcomes table with verifiable measurement methods; added IW-6 pointer to Technical Success bullet; rewrote Journey 3 + Real-Time Strategy to honestly describe polling cadence; rewrote Adoption Risks workload row to own the editorial tradeoff; added schedule-out-of-scope note to Resource Requirements; added IW-7 provenance note to NFR-P1; merged "What Makes This Special" + "Design Philosophy" into single thesis; trimmed MVP Strategy & Philosophy. Also added new open question IW-8 (inspector vs rigger labor pool) to docs/open-questions.md.'
releaseMode: 'phased'
inputDocuments:
  - '_bmad-output/project-context.md'
  - '.readme'
  - 'backend/dataflow.readme'
  - 'backend/erd.dbdiagram'
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 0
  projectContext: 1
  projectDocs: 0
  informalSpecs: 3
workflowType: 'prd'
projectMode: 'brownfield'
classification:
  projectType: 'web_app'
  domain: 'defense_logistics'
  complexity: 'medium'
  projectContext: 'brownfield'
  audience: 'handoff-team'
  scopeFocus:
    - 'inspection-workflow-ui'
    - 'notifications-and-alerts'
---

# Product Requirements Document - plims

**Author:** Jake
**Date:** 2026-05-16

## Executive Summary

PLIMS (Parachute Labor & Inventory Management System) is a brownfield internal web application that manages the three-way constraint between parachute inventory expiration (180-day repack cycle), rigger personnel availability, and scheduled airborne operations. MVP-1 is in production: dashboard KPIs, personnel availability grid, 24-month event calendar with per-event feasibility validation, and an inventory view with expiration tracking and bulk-add.

This PRD covers **Increment 2** — a two-epic upgrade on top of MVP-1:

**Epic A — Inspection Workflow UI. Treat inspection as part of the manning pipeline, not as a compliance ritual.** Every parachute moves through Packed → Initial-Inspected → Final-Inspected → Ready, with a named inspector at each stage. PLIMS surfaces the **inspection queue** (how many chutes are stuck where), **inspector workload** (who has been doing the work, who is available), and **time-in-stage** (how long a chute is sitting between packed and ready). The two-person inspection rule is treated as a labor cost the planner must reason about — the same way he reasons about rigger labor today — not as a signoff form to fill out. A complete record of who-signed-what naturally results and is preserved, but it is not the point.

**Epic B — Planning-Time Risk Surfacing.** A set of in-app warnings — calendar flags, planning-gap panels, expiration-wave indicators — surfaced to the **Senior NCO** while he is using the 24-month calendar for long-range planning. The system volunteers manning gaps, inventory shortfalls, and approaching expirations before they become last-minute crises. This is *not* an out-of-band notification system (no email, no SMS) — it is decision support inside the planner's existing workflow.

**Primary user (Increment 2):** The unit's Senior NCO / planner is the principal beneficiary of Epic B. Riggers and inspectors are the floor-level users of Epic A. Audit-time reviewers (command, IG) are downstream consumers of Epic A's signoff trail.

**What this PRD does NOT cover (explicitly out of scope, parked):** authentication / RBAC; out-of-app notifications (email/SMS/push); empirical production logging via `daily_logs.pack_count`; reserve-vs-main differentiated feasibility math; export/reporting beyond the inspection trail PLIMS naturally produces. These are tracked in `docs/open-questions.md` (GEN-1, GEN-2, NA-1).

### Design Philosophy

PLIMS is the only system in the unit's hands that treats every step in the packed-to-ready pipeline — **rigging AND inspection** — as part of one connected manning equation. A whiteboard might show the airborne schedule; a spreadsheet might count chutes; neither tells the Senior NCO that next month's wave isn't blocked by chute supply but by **inspector** shortage. The core insight is operational: **inspection labor is a constrained resource the planner has been managing implicitly, and Increment 2 surfaces it explicitly.** Epic A makes inspection labor visible and measurable at the floor level (queue depth, workload, time-in-stage); Epic B feeds that visibility into the planning view so the Senior NCO sees inspector shortages with the same clarity as rigger shortages. Off-the-shelf inventory and workflow tools treat inspection as a checklist with a signature box — a record-keeping problem. PLIMS treats it as a *throughput problem*: how many chutes can two distinct inspectors move through the queue in a working day, and is that pace fast enough for the next airborne op? Audit-quality records of who signed what are produced as a side-effect of running the workflow correctly, but they are never the headline value — the headline is that the planner sees the bottleneck before it bites. When the handoff team faces a design judgment call ("should this feature lean toward audit completeness or operational speed?"), the answer is always **operational speed**, until and unless an explicit audit requirement enters scope.

## Project Classification

| Field | Value |
|---|---|
| **Project Type** | Web Application (React SPA frontend + Express REST API backend) |
| **Domain** | Defense Logistics (Army Rigger operations) — adjacent to aerospace safety-critical equipment management |
| **Complexity** | Medium — moderate technical complexity (CRUD + multi-constraint engine), real domain complexity (Army doctrine, repack cycles, two-person inspection chain) |
| **Project Context** | Brownfield — MVP-1 is shipping; Increment 2 layers on top of an existing, working system |
| **Audience** | Handoff team (PRD serves as a contract document with explicit acceptance criteria) |
| **Increment Scope** | Two epics: Inspection Workflow UI; Planning-Time Risk Surfacing for the Senior NCO |
| **Operational lens** | Manning, planning, and operations — *not* audit or compliance. Audit-quality artifacts are a side-effect of treating inspection as part of the manning pipeline, not the goal. |

## Success Criteria

### User Success

**Inspectors (Epic A floor users):**

- An inspector can advance a chute through a single inspection stage in fewer than 15 seconds, screen-load to confirmation. Speed matters because *throughput* matters, not because UX is nice.
- An inspector sees their own work queue *and* the unit-wide queue depth without filtering manually.
- Same-person-as-packer attempts to inspect are rejected with a clear message — this rule is operational (separation of labor reduces error rate), not just procedural.

**Riggers (Epic A floor users):**

- A rigger can see how many of their packed chutes are awaiting inspection (and at which stage) without asking anyone.

**Senior NCO (Epic B planner, and Epic A's planning consumer):**

- During long-range planning he sees, in one view: rigger manning AND inspector manning, current inspection queue depth, and how all three constraint families (rigger labor / inspector labor / inventory) affect feasibility for any event.
- A red flag on the calendar tells him **why** an event is infeasible — "not enough riggers," "not enough inspectors," or "not enough ready chutes" — at the same level of specificity.
- A manning gap, inspection-queue backlog, OR inventory gap all surface as first-class warnings during planning; no one of the three is hidden.

### Operational / Business Success

- **Inspection bottleneck visibility:** at any moment, the unit can answer "how many chutes are stuck waiting for inspection, and for how long" in one click.
- **Inspector capacity is in the math:** the existing feasibility engine (`LaborMatrix` + `Feasibility`) considers inspector throughput, not just rigger throughput. Events flagged unfeasible because of an inspector shortage are flagged with that specific reason.
- **Time-in-stage budget:** the median chute moves from Packed to Ready within **N** days. N is open — to be set by the Senior NCO during the planned user interview. Tracked in `docs/open-questions.md` (IW-5).
- **Lead time on red flags:** the Senior NCO sees a red-flagged event at least **14 days** before its draw date.
- **Zero "silent" infeasibility:** an event that becomes infeasible due to an availability change (rigger or inspector) reappears as red the next time the calendar loads — no manual recheck required.

### Technical Success

- State transitions enforced server-side: `packed → initial_inspected → final_inspected → ready`.
- Distinct-person constraint enforced at API/DB layer (not just UI): `packer_id ≠ initial_inspector_id ≠ final_inspector_id`.
- **Inspector capacity computed alongside rigger capacity** in the business-logic layer — a new method or class parallel to `LaborMatrix.getDailyCapacity` (inspector edition).
- **Time-in-stage tracking** captured via per-stage timestamp columns on `parachutes` (`packed_at`, `initial_inspected_at`, `final_inspected_at`). The decision to use columns rather than a transition-log table is parked at MVP per [`docs/open-questions.md#IW-6`](../../docs/open-questions.md#iw-6), with an explicit revisit trigger when the Growth rework path is scoped (rework loops would overwrite columns and break median-time-in-stage computation; the Measurable Outcomes row above carves out chutes-with-zero-rejections accordingly).
- Planning-health endpoint p95 < 800ms on the 24-month forecast.
- Migrations round-trip cleanly (per project-context.md Testing & Verification rule 8).
- No regression in MVP-1 endpoints.

### Measurable Outcomes

| Metric | Target | Measured by |
|---|---|---|
| Inspection signoff time (median) | < 15 seconds (placeholder pending [IW-7](../../docs/open-questions.md#iw-7); Journey 2 narrative shows ~11s, so 15s carries ~36% buffer) | UAT: time at least 10 inspector signoffs with an unrelated observer; report the median. Single-stopwatch samples do not count. |
| Inspection queue depth visible to Senior NCO in one click | Acceptance: Yes | UAT walkthrough confirms one tap from Calendar opens the queue view (binary acceptance, not a metric) |
| Median time-in-stage (Packed → Ready), for chutes with zero rejections in the window | ≤ N days, N set per [IW-5](../../docs/open-questions.md#iw-5) | DB query against `packed_at` / `final_inspected_at`, filtered to chutes with no `process_stage` regression in the window. See Technical Success bullet for the timestamp-columns architectural decision. |
| Inspector-shortage feasibility reason surfaced distinctly | Acceptance: Yes | UAT walkthrough confirms event-detail view shows three separate reason lines (rigger / inspector / inventory) per FR15 + FR20 (binary acceptance) |
| Lead time on red-flag events seen by Senior NCO | Removed as a tracked metric for Increment 2 | Emergent property of FR21 + FR22 (persistent flag + re-evaluation on availability change). No flag-impression audit log exists in MVP scope; re-add this metric in a future increment if such a log is added. |
| Planning-health endpoint p95 latency | < 800ms | Local timing per NFR-P3, dev-environment dataset |
| MVP-1 endpoint regression count | 0 | Run the `backend/smoke-curls.md` checklist (per FR28) against pre- and post-merge builds; expected response shapes are listed in the checklist itself. |

## Product Scope

### MVP — Minimum Viable Increment 2

**Epic A — Inspection in the manning pipeline:**

- Schema migration adding `initial_inspector_id`, `final_inspector_id`, `packed_at`, `initial_inspected_at`, `final_inspected_at` to `parachutes`. FK constraints on inspector columns.
- API endpoints to advance `process_stage`, capturing inspector identity and timestamp.
- Server-side enforcement of the distinct-person rule (`packer_id ≠ initial_inspector_id ≠ final_inspector_id`).
- Auto-transition: `process_stage: final_inspected` → `status: ready`; `last_pack_date` derived from `packed_at` if not already set.
- **Inspector capacity computed in business logic** — mirror of rigger capacity in `LaborMatrix`.
- **Inspection queue UI panel** — chutes by stage, age-in-stage visible, accessible from the existing Inventory view.
- "Who am I?" dropdown for inspector identification (auth-deferred, flagged risk — GEN-2).

**Epic B — Planning-Time Risk Surfacing:**

- "Planning Health" panel on Calendar showing: next-30-day rigger labor gap, next-30-day inspector labor gap, next-90-day expiration wave count, count of infeasible events in next 180 days **broken down by reason** (rigger short / inspector short / inventory short).
- Calendar red flag persists between first appearance and resolution/draw-date.
- Feasibility re-runs on data changes to availability and inspection-queue depth.

### Growth Features (post-MVP, fast-followers)

- Inspection rejection / rework path with reason capture (sends chute back to `process_stage: unpacked`).
- Drill-down from Planning Health into "show me which event / which chute / which person."
- Inspector productivity view (chutes-per-shift, chutes-per-inspector).
- Configurable warning thresholds (e.g., "warn at 60-day expiration wave instead of 90").
- Inspection trail export (PDF / CSV) — moved from MVP to Growth because the framing is operational, not audit. Re-prioritize only if external compliance review demands it.

### Vision (future increments, deferred)

- Authentication / RBAC (GEN-2). Until landed, inspector identity is captured but not authenticated.
- Out-of-app notifications (NA-1).
- Empirical production logging via `daily_logs.pack_count` (GEN-1).
- Reserve-vs-main differentiated capacity rules.
- Mobile / field-tablet UI for floor-level inspection.
- ML demand forecasting (multi-year).
- **Production DB backup strategy** (cron-driven `pg_dump`, off-host storage). Unit-side operational concern, not addressed in Increment 2 — flag for the handoff team to plan separately.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**Release mode:** Phased — MVP (Increment 2), Growth (fast-followers), Vision (future) — defined in Product Scope above. This PRD scopes the MVP only.

**MVP philosophy:** Problem-solving — solve a present operational problem (inspection bottleneck invisibility + planning-time inspector-shortage blindness), not build a platform or run a market experiment. Validated-learning loop is short: ship to the unit, let the Senior NCO and inspectors use it for one full ops cycle, gather feedback in a user interview, iterate. Growth features sit on top of the MVP's data model — building them together delays the data the planner already needs.

**MVP done when:**

1. An inspector signs off a chute in under 15 seconds with their identity captured.
2. The Senior NCO sees on the calendar that an event is infeasible **because of inspectors**, not just "infeasible."
3. The two-person rule and the packer ≠ inspector rule are enforced — no chute reaches Ready without three distinct people having touched it.
4. The planner's calendar updates without him asking when availability changes.

If those four work, MVP shipped.

### Resource Requirements

- **Team size assumption:** Small handoff team (1–3 engineers). At current codebase scale 1 engineer can own backend changes end-to-end. Frontend can parallelize to a second engineer. A third is luxury.
- **Required skills:** TypeScript + Express + Knex + Postgres on backend; React 19 + Tailwind + Shadcn on frontend. No exotic technology introduced.
- **Domain access:** **The Senior NCO must be available** for one substantive user-interview session early (to resolve IW-1, IW-5, IW-7, WAP-1, NA-2) plus ad-hoc UAT walkthroughs. Without that access, the increment ships with placeholder thresholds and a higher risk of operational misfit.
- **Infrastructure:** None new. Existing `docker-compose` stack is sufficient for dev and unit deployment.
- **Schedule:** Increment 2's target ship date and Epic A → Epic B sequencing are owned by the handoff team's intake meeting, not by this PRD. If a calendar anchor is required downstream (e.g., a story-completion deadline tied to a unit ops cycle), it is captured in the Sprint Plan, not back-filled here.

### Risk Mitigation Strategy

#### Technical risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Inspector capacity math integration breaks existing `LaborMatrix` semantics | Medium | High | Implement inspector capacity as a **parallel class** (`InspectorCapacity`) mirroring `LaborMatrix`, not as in-place changes. Compose both in `Feasibility`. Snapshot-compare MVP-1 feasibility output against post-Increment-2 output for a fixed event set. |
| Schema migration adds 5 new columns to `parachutes`; backfill of existing rows non-trivial | Medium | Medium | Migration handles existing rows: `packed_at` defaults to `last_pack_date` if non-null; inspector ID columns and other timestamps default to NULL. Round-trip migration locally before merge (project-context.md Verification rule 8). |
| Same-person rule enforced at multiple layers risks falling out of sync between UI, API, DB | Low | Medium | Define the rule once at the API/business-logic layer (source of truth). UI rejects locally only as UX optimization; DB check constraint is safety net. |
| Persistent red-flag state requires either flag-history storage or recomputation on every load | Low | Low | Recompute on load; rely on existing `getEventFeasibility` path. Acceptance: visible flag latency on calendar open < 800ms. |

#### Adoption risks (unit-internal equivalent of "market risk")

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Inspectors prefer the paper log and don't sign off in PLIMS, leaving the chain incomplete | Medium | High (defeats the entire increment) | One-shot training session led by 1SG or Senior NCO at rollout. Visible Inspection Queue display in the bay (projector or shared monitor) so queue depth is a *team* number, making the system part of floor culture. |
| Senior NCO does not look at the Planning Health panel because his planning ritual lives elsewhere (spreadsheet, whiteboard) | Medium | High | Validate the panel design with him directly during the user interview *before* implementation. If he says "I'd never look there," redesign before coding. |
| Inspector workload imbalance becomes visible and creates interpersonal friction | Low | Low | **Acknowledged tradeoff.** Per-inspector counts are surfaced *by design* so the Senior NCO can see when inspectors are being pulled for other details (Journey 3's CPL Garcia example demonstrates this signal in action). Displaying counts side-by-side is itself an editorial act — the PRD does not claim neutrality. What the system explicitly does NOT add: performance ratings, leaderboard rankings, color-coded shaming, or per-person comparisons rendered to non-NCO viewers. If on-floor social cost outweighs planning value during rollout, FR8 can be re-scoped to per-shift or per-role aggregates (removing per-person granularity) in a Growth iteration. |

#### Resource risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Senior NCO unavailable for user interview to resolve open questions | Medium | High | If unresolvable, the team must pick conservative defaults *and document them as assumptions in the PRD* or pause MVP scoping until the interview happens. Do not invent values. |
| Handoff team has fewer engineers than expected (1 instead of 2) | Medium | Medium | MVP is partition-able. With only 1 engineer, sequence Epic A first since Epic B depends on its data. Drop the Inspection Workload view from MVP (move to Growth) if needed to make the timeline — **but propose this back to Jake explicitly before acting on it.** |
| No test framework + no CI = regression risk grows with each PR. Per project-context.md, "you are the CI." | High | Medium | Pre/post smoke-curl run on every PR touching backend routes. List specific endpoints in the PR template (when one exists). Manual click-through of Dashboard / Personnel / Calendar / Inventory in `npm run dev` before any backend merge that touches `routes/api.ts`. |

### What is explicitly NOT being silently re-scoped

The Product Scope section above was authored from explicit user input and remains the binding scope list. This Scoping section does not move any item between MVP / Growth / Vision. If at any point the handoff team proposes moving an item, it must come back to Jake for explicit re-scoping.

## User Journeys

### Journey 1 — SGT Doe (Rigger): packs a chute, follows it to Ready

**Opening scene.** Friday morning, 0930. SGT Doe is on the packing floor. He finishes packing T-11 serial AC-2049 and flips to the PLIMS tablet at the end of his bench. He taps **My Packs** and sees AC-2049 land in his list with status "Awaiting initial inspection" and a timer that starts ticking — *0 minutes in stage*.

**Rising action.** Over the next two hours he packs three more chutes. Each one joins the queue. When he checks the **My Packs** view after lunch, AC-2049 has moved to "Awaiting final inspection" — meaning CPL Vasquez has already cleared the initial. The age-in-stage shows 47 minutes. Doe sees his fourth pack of the day, AC-2052, has been sitting for almost two hours at "Awaiting initial." Initial-inspection queue must be getting deep.

**Climax.** At 1530 he checks once more before end of shift. AC-2049 reads **Ready**, with 1SG Chen's name on the final signoff and a timestamp of 1521. Doe's day's work is officially in the inventory pool.

**Resolution.** He leaves the floor knowing exactly how many of his chutes cleared — and which ones are stuck. He doesn't need to ask anyone. The data the planner sees and the data he sees are the same data.

**Capabilities this journey reveals:** "My Packs" filtered view by `packer_id`, age-in-stage display, status badge per chute, persistent identity dropdown for current-user context (until auth lands).

---

### Journey 2 — CPL Vasquez (Initial Inspector): clears the queue

**Opening scene.** 1100, mid-shift. CPL Vasquez has been pulled off packing to do inspections for the day. He opens **Inspection Queue** in PLIMS. The view shows 14 chutes awaiting initial inspection, oldest first. The top of the list is AC-2049 (packed by SGT Doe, 90 minutes ago).

**Rising action.** He pulls AC-2049 from the rack, runs the physical inspection, taps the serial on the tablet, taps **Pass Initial**, confirms his identity in the dropdown. The chute disappears from his queue and reappears in the **Awaiting Final** queue. Elapsed: 11 seconds on the tablet, ~4 minutes total with the physical inspection.

**Edge case.** Chute AC-1987 was packed by Vasquez himself yesterday — he forgot. He taps **Pass Initial**. PLIMS rejects: *"You can't initial-inspect a chute you packed. Send to a different inspector."* He moves on to the next chute. No frustration — the rule fired clearly and instantly.

**Climax.** Over the next 90 minutes he clears 12 chutes. The queue depth drops from 14 to 2. He scans the **Today** tab and sees: 12 chutes initially inspected, 0 rejected, 4 minutes median per inspection. His day's contribution is legible to him and to the planner.

**Resolution.** End of shift he closes the tablet. He hasn't filled out a single piece of paper. He doesn't have to remember who he inspected for or in what order — PLIMS has it.

**Capabilities this journey reveals:** Inspection queue (sortable by age), one-tap stage advance, identity capture per signoff, distinct-person validation with user-friendly error, per-inspector "Today" view.

---

### Journey 3 — 1SG Chen (Senior Inspector / Final): catches a backlog

**Opening scene.** 1400 Friday. 1SG Chen opens PLIMS expecting to clear final inspections. The **Awaiting Final** queue shows 9 chutes — manageable. But she also glances at the **Awaiting Initial** queue: 22 chutes. Yesterday it was 6. Something's piling up.

**Rising action.** She works through her 9 finals (median 6 minutes each including physical) and clears them by 1500. The final signoff fires the auto-transition: each chute flips to `status: ready` and lands in the available-inventory pool. The planner-facing inventory counter on the dashboard projected at the back of the room ticks up within seconds — the dashboard polls every 5–10 seconds (per NFR-P6), so newly-Ready chutes appear on a short delay rather than instantly.

**Climax.** Before leaving, she taps the **Inspection Workload** view. CPL Vasquez did 12. SSG Garcia did 3. Garcia is supposed to be on inspection today too. Chen catches the imbalance and walks over to find out why — turns out Garcia was pulled for a detail. The data made the management problem visible without anyone reporting it up.

**Resolution.** She tells MSG Riley (the Senior NCO) what she saw and what she did about it. By Monday the inspection-queue depth is back to single digits.

**Capabilities this journey reveals:** Awaiting-final queue, auto-transition `final_inspected → ready`, real-time inventory-counter update, Inspection Workload view (chutes-by-inspector for the period), cross-team workload visibility.

---

### Journey 4 — MSG Riley (Senior NCO): long-range planning, catches an inspector shortfall

**Opening scene.** Tuesday 0700. MSG Riley sits down with coffee to plan the next training quarter. He opens the 24-month Calendar in PLIMS. Three events visible in October. Two are green. One — Op Bayonet, draw date 18 October — is red.

**Rising action.** He taps the red event. PLIMS shows him three lines:

- Rigger labor: ✅ sufficient (62 rigger-days available, 48 required)
- Inspector labor: ❌ short (only 22 inspector-days available, 48 required — assumes 2 inspections per chute)
- Ready inventory: ✅ sufficient (180 ready, 48 required)

The **why** is inspector throughput, not chutes or riggers. Riley has been thinking about Op Bayonet as a chute-supply problem for weeks. PLIMS just told him he was looking in the wrong place.

**Climax.** He opens the **Planning Health** panel. Next 30 days: rigger labor gap zero, inspector labor gap 26 days. Next 90 days: expiration wave of 87 chutes. Op Bayonet is one of three events flagged "infeasible: inspector short." He can act on this NOW — pull more inspectors, cross-train Garcia, or shift Op Bayonet by 10 days.

**Edge case — the silent shift.** Wednesday afternoon, SFC Park goes on emergency leave. Park is one of three senior inspectors. When Riley opens PLIMS Thursday morning, Op Cherokee — which was green Wednesday — is now red. The system rechecked. No one had to ask.

**Resolution.** Riley walks into the weekly planning meeting with a concrete answer instead of a hunch. The planning conversation moves from "I think we might have a problem" to "we need to either reschedule or cross-train; here are the dates."

**Capabilities this journey reveals:** Calendar red flag with reason breakdown (rigger / inspector / inventory), Planning Health panel (30/90/180 day windows), per-event feasibility detail view, automatic re-feasibility on availability changes, persistent red-flag state.

### Journey Requirements Summary

| Capability | Surfaced by journey(s) | Epic |
|---|---|---|
| Inspection Queue (sortable by age-in-stage) | 2, 3 | A |
| "My Packs" / "My Inspections" views | 1, 2, 3 | A |
| One-tap stage advance with inspector identity | 2, 3 | A |
| Distinct-person rule with clear error | 2 | A |
| Auto-transition `final_inspected → ready` with inventory-counter update | 3 | A |
| Inspection Workload view (chutes-by-inspector) | 3 | A |
| Age-in-stage tracking (via per-stage timestamps) | 1, 2 | A |
| Calendar red flag with reason breakdown (rigger / inspector / inventory) | 4 | B |
| Planning Health panel (30/90/180 day windows) | 4 | B |
| Per-event feasibility detail view | 4 | B |
| Automatic re-feasibility on availability changes | 4 | B |
| Persistent red-flag state until resolution/draw-date | 4 | B |
| Inspector capacity in `LaborMatrix`-equivalent business logic | 4 (and underpins 1, 3) | A + B |

## Domain-Specific Requirements

Per the operational framing for this PRD (`manning, planning, operations — not audit`), the domain requirements below are written as **operational rules of the road for the unit**, not as a compliance checklist. They exist because Army Rigger ops impose them, and PLIMS must respect them — but the goal is operational correctness, not regulator satisfaction.

### Operational Rules (encoded in the system today, must be preserved)

| Rule | Source | Where encoded |
|---|---|---|
| **180-day repack cycle.** A parachute's pack expires 180 days after its last pack date. After expiration the chute is not usable for issue until repacked. | Army Rigger doctrine | `Inventory.getExpirationStatus()` (backend) — `daysUntilExpiration <= 0 → status: expired` |
| **12-pack/day cap per rigger (15 in surge).** A single rigger cannot reasonably pack more than 12 chutes in a working day. Surge mode raises the cap to 15 for limited-duration high-tempo operations. | Doctrine / operational reality | `LaborMatrix.PACK_LIMIT = 12`; `Feasibility` reads `event.surge_mode ? 15 : 12` |
| **M–F work week.** Riggers work Monday through Friday; weekend capacity is zero unless explicitly flagged. | Unit operating rhythm | `LaborMatrix.getRangeCapacity` excludes `day === 0 \|\| day === 6` |
| **Same-day demand aggregation.** Multiple events sharing a draw date compete for the same ready-chute pool; demand sums across them. | Resource-allocation reality | `Feasibility.checkEventFeasibility` aggregates `quantity_required` across events with matching `draw_date` |
| **Two distinct inspectors.** A chute cannot move from Packed → Ready without two separate inspections by two different people (initial, then final). | Doctrine / safety practice | New for Increment 2 — `initial_inspector_id`, `final_inspector_id`, enforced distinct |
| **Packer ≠ inspector.** A rigger cannot inspect a chute they themselves packed. | Doctrine / separation of labor | New for Increment 2 — enforced at API/DB |

### Operational Rules (NOT encoded today — explicitly out of scope for Increment 2)

| Rule | Why it's out of scope now | Where it goes |
|---|---|---|
| **Reserve vs main differentiated rules.** Reserve parachutes have distinct doctrine (typically inspected more rigorously, sometimes longer repack interval, sometimes stricter inventory accounting). | Codebase currently treats both via `parachutes.category` enum but applies identical rules. Differentiation requires Senior NCO subject-matter input — not yet collected. | Vision / future increment |
| **Inspector-of-record authentication.** Today PLIMS captures inspector identity via a "Who am I?" dropdown — this is not authenticated. A malicious or careless user can pose as another inspector. | Auth is a larger separate epic (GEN-2). Increment 2 ships with this as an explicit known risk. | Vision / GEN-2 |
| **Empirical production logging.** `daily_logs.pack_count` exists in schema but nothing writes to it. Feasibility math today is *capacity*-based, not *actuals*-based. | Switching feasibility to actual production requires every pack to be logged at the moment of packing — a UI change not in this increment's scope. | Vision / GEN-1 |

### Technical Constraints Imposed by the Domain

- **Safety-critical equipment integrity.** A chute incorrectly marked Ready could be issued to a jumper. The system must never silently transition a chute to Ready without a complete signoff chain. This is the *single hardest* invariant in the codebase and is enforced server-side, not in the UI. (Project-context.md captures this — `status` and `process_stage` are independent axes; do NOT conflate.)
- **Time semantics: business day vs. calendar day.** Capacity math uses *business* (M–F) days. UI surfaces show *calendar* dates. Agents adding date math must respect the distinction (per the existing `getRangeCapacity` weekend skip).
- **Date format invariant.** All schedule fields (`jump_date`, `draw_date`, `packed_at`, etc.) are stored and exchanged as `YYYY-MM-DD` strings in the DB and JSON layer. Per project-context.md, do NOT pass `Date` objects to Knex date filters.

### Integration Requirements

Increment 2 introduces **no new external integrations**. PLIMS continues to run as a self-contained unit-internal application against its own Postgres. No SIPR/NIPR boundary crossing, no external API consumption, no government data feeds. This is by design — the unit owns the data lifecycle end-to-end.

### Domain-Specific Risks & Mitigations

| Risk | Likelihood | Operational impact | Mitigation in Increment 2 |
|---|---|---|---|
| A rigger uses a colleague's identity in the inspector dropdown (because auth isn't enforced) and accidentally bypasses the packer-≠-inspector rule | Medium | Erodes trust in the signoff chain; worst case allows a self-inspected chute to reach Ready | Distinct-person rule checked against captured values; capture is only fully mitigated when GEN-2 (auth) lands. Mitigation for now: log every signoff event with identity and timestamp so post-hoc review can spot anomalies. |
| Inspectors get pulled for other details, queue grows, planning relies on stale capacity assumptions | High (per Journey 3) | Events flagged feasible against capacity that doesn't actually exist | Time-in-stage tracking + Inspection Workload view make pulls visible immediately. Planning Health panel flags inspector-shortage events explicitly. |
| Surge-mode capacity inflation propagates inconsistently between `LaborMatrix.PACK_LIMIT` and `Feasibility` (both must stay in sync) | Low (codebase is small) | Feasibility shows green for events that aren't actually achievable | Until tests exist, flag as a mandatory review item for every PR touching either file. Per project-context.md Verification rule: build before claim done. |
| A failed inspection (chute rejected, reason logged) is treated as a state PLIMS doesn't currently model — chute is stuck in `in_process` with no rework path | Medium | Floor confusion, chutes drift outside the system | Inspection rejection/rework is in Growth, not MVP. For MVP, document the gap: rejected chutes are manually returned to `process_stage: unpacked` via DB intervention. Floor SOP must reflect this until Growth ships. |
| Reserve-vs-main rule mismatch — main-chute capacity math applied to reserve chutes that may have different real-world cycles | Low to medium (depends on unit) | Reserve inventory miscounted in feasibility | Explicit "Reserve vs main differentiation" out-of-scope notice + open question logged. |

### What the handoff team should NOT assume

- **Do not assume a regulatory audit is the validation gate.** The validation gate is the Senior NCO confirming the system reflects how the unit actually operates. Operational-correctness UAT, not compliance review.
- **Do not assume PLIMS is the system of record for personnel records.** PLIMS tracks operational availability; the system of record for HR/admin remains whatever the unit uses outside this app.
- **Do not assume reserve and main parachutes are interchangeable.** They aren't, even though Increment 2 doesn't yet differentiate them in the math.

## Web Application Specific Requirements

The stack and architectural conventions are documented in detail in `_bmad-output/project-context.md` and treated as binding for Increment 2. This section calls out the **web-app-specific decisions and constraints** unique to this increment's UI and runtime surface.

### Application Type

- **SPA** (Single-Page App) — React 19 + Vite, ESM. Existing routing is `useState`-driven view-switching in `App.tsx` (no `react-router`). Increment 2 follows the same pattern; new views are added by extending the existing union type and adding render cases. No router introduction in this increment.

### Browser & Device Support

- **Target platform: the unit's existing dev/floor hardware.** Concrete browser list TBD with the Senior NCO during the user interview (open question WAP-1). Working assumption until then: a recent Chromium-based browser (Chrome / Edge) on the existing tablets and workstations. No IE/legacy Safari support.
- **Tablet ergonomics matter.** Inspector journeys assume a tablet-on-bench form factor. Tap targets MUST be at least 44×44 pt; hover-only affordances are forbidden in the Inspection Queue and "My Packs/My Inspections" views. Riggers may be wearing gloves — text inputs should be minimized in inspection workflows in favor of tap-to-select.
- **No mobile-phone-form-factor target.** Increment 2 does not target a 360px-wide viewport. Tablets (≥ 768px) and desktop are the targets.

### SEO

Not applicable — unit-internal application; not indexed; not crawled.

### Real-Time Strategy

- **Polling, NOT websockets.** Multiple journey moments imply near-real-time feel (Journey 3: inventory counter ticks up; Journey 4: Op Cherokee silently re-flags overnight). These are achieved via **scheduled polling** on view-load and on a modest interval (5–10 seconds) while a view is active — not via websockets.
- **Reasoning:** project-context.md rule (Framework-Specific #14) explicitly forbids adding new UI/runtime dependencies unsolicited; websockets are a non-trivial addition (Express + ws library + client wiring + reconnect logic) that this increment does not justify. The user pool is single-digit; polling load is negligible.
- **Acceptance bar:** the "Op Cherokee silently re-flags" experience must work on a tablet that was closed yesterday and opened today — i.e., the feasibility recheck happens server-side at request time, not client-side. As long as the page fetches fresh data on load and on the polling cadence, the user perceives "the system rechecked."
- **Journey 3's "tick up" language refers to this polling cadence (a few-second delay), not a true real-time push.** Inspector confirmations land in the DB instantly; observers on the projected dashboard see them within the next poll cycle (5–10s per NFR-P6).
- **If real-time becomes a hard requirement later**, websockets are a future-increment investment, not a stretch for this one.

### Performance Targets

See **Non-Functional Requirements → Performance (NFR-P1 through NFR-P6)** for canonical, testable performance targets.

### Accessibility

Accessibility bar is calibrated to a small, known user pool — not the general public. Keyboard-operable critical flows and non-color-dependent feasibility cues are the non-negotiables. See **Non-Functional Requirements → Accessibility (NFR-A1 through NFR-A5)** for testable details.

### Responsive Design

- **Tablet (≥ 768px) and desktop (≥ 1024px) layouts are first-class.**
- Inspection Queue and "My Packs" / "My Inspections" views must be usable in tablet portrait (768 × 1024). Calendar and Planning Health panel are desktop-primary (≥ 1280px); tablet acceptable, mobile not targeted.

### Explicit non-goals

- **No native features** — no PWA install, no service worker, no offline mode, no push notifications API. The app is opened in a browser on hardware the unit owns; that is the entire deployment surface.
- **No CLI / no scripting interface** for this increment. (The backend npm scripts cover the dev/admin operations the handoff team needs.)

### Implementation Considerations

- **All UI additions go in `frontend/src/components/`** (PascalCase for feature views, lowercase for shadcn UI primitives). Reuse existing primitives (`button`, `card`, `dialog`, `tabs`, `scroll-area`, `popover`); add new shadcn primitives only when the existing set genuinely doesn't cover the case.
- **Per project-context.md frontend rules:** Tailwind class composition uses `cn()` from `@/lib/utils`; use Shadcn semantic colors (`bg-background`, `text-muted-foreground`), not raw palette names.
- **The View Switcher in `App.tsx`** must be extended to add an "Inspection" tab. Pattern follows existing entries.
- **Inspector identity persistence:** the "Who am I?" dropdown selection should persist for the session (in-memory or localStorage). Do NOT persist across browsers (multi-tablet contamination risk). Document this clearly in the UI ("This tablet is currently signing as: CPL Vasquez. Tap to change.").

## Functional Requirements

Each requirement below is a **testable capability** stated at WHAT-altitude (no HOW, no UI specifics, no technology choices). Together they form the binding capability contract for Increment 2 — anything not listed here will not exist in the shipped product unless explicitly added.

Actor abbreviations: **Rigger** (packs chutes), **Inspector** (initial or final, generic role), **Senior NCO** (the planner), **System** (no human actor — automated behavior).

### Inspection State Machine

- **FR1.** A Rigger can mark a chute as packed, capturing the rigger's identity and the pack timestamp.
- **FR2.** An Inspector can advance a chute from packed to initial-inspected, capturing the inspector's identity and timestamp.
- **FR3.** An Inspector can advance a chute from initial-inspected to final-inspected, capturing the inspector's identity and timestamp.
- **FR4.** The System automatically transitions a chute to status "Ready" upon final-inspection signoff, with no manual step required.

### Inspection Queue & Activity Views

- **FR5.** An Inspector can view all chutes currently awaiting inspection — filterable to awaiting-initial, awaiting-final, or both — sorted by age-in-stage.
- **FR6.** An Inspector can view their own inspection activity for the current calendar day, scoped to chutes they personally inspected since 00:00 local time, including count and median signoff time.
- **FR7.** A Rigger can view chutes they personally packed and observe each chute's current stage and age-in-stage.
- **FR8.** Any user can view per-inspector workload counts (chutes-inspected) over a configurable window between 1 and 90 days, default 7 days. See **Risk Mitigation Strategy → Adoption Risks** for the editorial tradeoff this surfacing introduces.

### Inspector Identity & Safeguards

- **FR9.** An Inspector identifies themselves to the System via a session-scoped identity selection before performing any signoff action.
- **FR10.** The System rejects any attempt by an Inspector to inspect a chute they themselves packed, with an explicit error message.
- **FR11.** The System rejects any attempt to use the same person for both initial and final inspection of the same chute, with an explicit error message.
- **FR12.** An Inspector can switch the active identity at any time without restarting the application.

### Inspector Capacity & Throughput Math

- **FR13.** The System computes total daily inspection capacity as `active inspector count × inspection-per-day cap`, mirroring the existing rigger-capacity computation. **Default constant: 12 inspections per inspector per day** (matches the rigger pack cap); final value pending Senior NCO confirmation via [`docs/open-questions.md#IW-7`](../../docs/open-questions.md#iw-7). Whether inspection labor is a separate pool from rigging or drawn from the same pool is tracked as [`IW-8`](../../docs/open-questions.md#iw-8) — until IW-8 resolves, the math models them as separate, which may overstate capacity if they actually share.
- **FR14.** The System computes inspection-throughput requirements per event as `chutes-required × inspections-per-chute`, where **`inspections-per-chute = 2`** (one initial + one final), and compares against available inspector capacity over the packing window.
- **FR15.** The System distinguishes inspector-capacity shortage from rigger-capacity shortage and inventory shortage in feasibility output.

### Time-in-Stage Tracking

- **FR16.** The System records the timestamp of each stage transition (packed, initial-inspected, final-inspected) for every chute.
- **FR17.** A user viewing a chute can see its current age-in-stage (elapsed time since the most recent stage transition).
- **FR18.** The System computes median time-in-stage from Packed to Ready over a configurable period, available for use in Planning Health and ad-hoc operational review.

### Calendar Risk Surfacing (Epic B)

- **FR19.** The Senior NCO can see, on the 24-month calendar, every event's current feasibility status (feasible / infeasible).
- **FR20.** The Senior NCO can open an infeasible event and see the specific reason(s): rigger-short, inspector-short, inventory-short — or any combination.
- **FR21.** An infeasible (red-flag) status persists on the calendar from first appearance until the event is resolved (made feasible) or its draw date passes.
- **FR22.** When availability for a Rigger or Inspector changes, the System re-evaluates feasibility for all events whose draw date falls between today and 24 months out before the next planner view load.

### Planning Health Visibility (Epic B)

- **FR23.** The Senior NCO can view a Planning Health summary showing: next-30-day rigger labor gap, next-30-day inspector labor gap, next-90-day expiration wave count, and infeasible-event count for the next 180 days.
- **FR24.** Each Planning Health metric is presented as a noun phrase that includes the unit and the time window (e.g., "26 inspector-days short over next 30 days," not just "26").
- **FR25.** The Planning Health view breaks down the infeasible-event count by reason category (rigger-short, inspector-short, inventory-short).

### Live Data Surfaces

- **FR26.** The System reflects a chute's transition to Ready in dashboard and inventory counts without requiring the user to manually refresh.
- **FR27.** The Inspection Queue and Planning Health surfaces refresh their data on view load and on a recurring cadence while the view is active.

### Existing-System Preservation (regression guard)

- **FR28.** All existing MVP-1 endpoints — events CRUD, personnel CRUD and availability, parachute CRUD and bulk, dashboard stats, and per-event feasibility check — continue to function with the same response shapes after Increment 2. Verified by running the curl smoke set captured in `backend/smoke-curls.md` (to be created by the handoff team as part of MVP scaffolding) against pre- and post-merge builds.
- **FR29.** The existing 12-pack/day rigger cap (15 in surge mode) is preserved unchanged.
- **FR30.** The existing 180-day repack expiration logic is preserved unchanged.
- **FR31.** The existing M–F work-week assumption in capacity calculations is preserved unchanged.
- **FR32.** The existing same-day demand aggregation in feasibility (summing quantity_required across events sharing a draw date) is preserved unchanged.

## Non-Functional Requirements

Each NFR is specific and testable. Categories that do not materially apply to Increment 2 (**Scalability**, **Integration**) are omitted intentionally — the user pool is single-digit, the deployment is unit-internal, and no new external integrations are introduced.

### Performance

- **NFR-P1.** Inspection-stage advance (Pass Initial / Pass Final) completes end-to-end (UI tap → API call → DB write → UI confirmation) in **≤ 15 seconds** at p95 on dev hardware. Target is a placeholder pending Senior NCO confirmation ([IW-7](../../docs/open-questions.md#iw-7)); Journey 2 shows ~11s in narrative, so the 15s target carries a ~36% buffer.
- **NFR-P2.** Inspection Queue view renders **≤ 500 ms** for a queue of up to 50 chutes on dev hardware. List virtualization is not required at current scale; revisit if queue grows beyond ~500.
- **NFR-P3.** Planning Health endpoint responds in **p95 < 800 ms** for the 24-month forecast window on the dev-environment dataset.
- **NFR-P4.** Calendar view loads with feasibility flags resolved in **< 800 ms** at p95 for a calendar containing up to 100 events.
- **NFR-P5.** Initial Dashboard page load (cold cache) completes in **< 2 s** on dev hardware.
- **NFR-P6.** Polling cadence for active views (Inspection Queue, Planning Health, Dashboard) is configurable in the frontend code; default is **every 5–10 seconds** while a view is the active tab. Polling pauses when the browser tab is hidden (via `document.visibilityState`) to avoid unnecessary load.

### Security

The security posture for Increment 2 is **prototype-grade by design**, with explicit known weaknesses. The NFRs below codify what IS required versus what is explicitly deferred.

- **NFR-S1.** All API endpoints reject requests that attempt to mutate inspector-identity fields on completed stage transitions (once `initial_inspector_id` is set, it cannot be silently changed via the existing route).
- **NFR-S2.** Database constraints enforce the distinct-person rule (`packer_id ≠ initial_inspector_id ≠ final_inspector_id` when all three are non-null). The constraint is the safety net; API logic is the primary gate.
- **NFR-S3.** All inspector signoff events are recorded with their timestamp and the identity-as-captured. The record is append-only at the API level — there is no DELETE endpoint for signoff events in MVP.
- **NFR-S4.** Default DB credentials (`plims_user` / `plims_password` in `docker-compose.yml` and `knexfile.ts`) MUST be overridden via environment variables in any non-development deployment. The handoff team is responsible for ensuring this on unit-side deployment. Repo contents remain dev-defaults only.
- **NFR-S5.** CORS remains origin-permissive for Increment 2 because there is no auth and no need to lock origin. When auth lands (GEN-2 Vision), CORS must tighten.

### Reliability & Data Integrity

- **NFR-R1.** For any chute that enters the inspection workflow **after** the Increment 2 migration runs, no chute can reach `status: ready` without the corresponding `packer_id`, `initial_inspector_id`, and `final_inspector_id` all being non-null and distinct. This is a **hard data integrity guarantee** enforced at the API/DB level, not a goal. Pre-Increment-2 chutes that were already `status: ready` are grandfathered (the migration leaves their new inspector columns NULL); they become subject to NFR-R1 on their next pack cycle when they re-enter the workflow.
- **NFR-R2.** All schema migrations include a working `down`. Round-trip (`latest → rollback → latest`) MUST succeed on a clean dev DB before the migration is merged.
- **NFR-R3.** Stage-transition writes are atomic at the DB level — partial state (e.g., `initial_inspector_id` set but `process_stage` still showing `packed`) is not a possible outcome of a single request.
- **NFR-R4.** Loss of DB connectivity returns clear error responses (HTTP 5xx with body `{ error: 'message' }`) from API endpoints; the frontend surfaces a user-readable error rather than a silent failure. Follows the existing `/health` endpoint pattern.
- **NFR-R5.** No data is cached client-side past view-unmount in a way that would let stale inspection state survive a network event. Each view fetch reads from the API.

### Accessibility

- **NFR-A1.** Inspection Queue and "My Packs / My Inspections" views support **keyboard-only navigation** (Tab, Shift+Tab, Enter to confirm). An inspector with a wired keyboard can clear chutes without using the tablet touchscreen.
- **NFR-A2.** Feasibility flags on the calendar (red/green) MUST also carry a non-color signal — an explicit text label or icon — at the same prominence as the color cue. Color is never the sole indicator.
- **NFR-A3.** Tap targets in the inspector and rigger views are **at least 44×44 pt**. Hover-only affordances are forbidden in these views; all critical actions are tap-equivalent.
- **NFR-A4.** Color contrast for primary text and primary action surfaces meets **WCAG 2.1 AA** (4.5:1 for normal text, 3:1 for large/UI). Shadcn theme defaults are compliant; agents must not introduce custom colors that fall below.
- **NFR-A5.** Full screen-reader / VoiceOver support is **NOT** a target for this increment. Document in handoff to prevent later misinterpretation as a regression.

### Operability & Maintainability

- **NFR-O1.** Backend logs at least one entry per significant state change (chute stage transition, infeasibility flag fired) including the entity ID and actor identity, at info or error level as appropriate. Logging mechanism guidance (no `winston`/`pino`) is documented in `project-context.md` — not restated here.
- **NFR-O2.** The `/health` endpoint continues to return `{ status: 'ok', db: 'connected' }` on success and HTTP 500 on DB connectivity failure. Increment 2 does NOT extend the health endpoint to check inspection-queue depth or other business signals.
- **NFR-O3.** Migrations run automatically on container start via `npm run dev:migrate`. Increment 2's migration MUST be safe to run against a populated dev DB — backfill logic for existing chutes is included.
- **NFR-O4.** The handoff team can re-seed dev data via `npm run seed:run`; Increment 2 updates the seed file if its data shape changes. Seeds remain dev-only.
- **NFR-O5.** The application is runnable cold from the repo: `docker-compose up` from a fresh clone produces a working stack within < 5 minutes on standard dev hardware.

## Acknowledged Weaknesses

This section names risks that Increment 2 accepts as part of its prototype-grade posture. They are not NFRs (no testable target) and not mitigations (no control exists in scope). They are honest deferrals — surfaced here so reviewers can decide whether the operational value warrants the risk.

- **AW-1. Inspector-identity fraud is not mitigable until authentication lands.** Inspector identity is captured via a "Who am I?" UI dropdown — no authentication, no session control, no integration with personnel records as a source of identity truth. A user can pose as any inspector. NFR-S3's append-only signoff log captures *what was typed*, not whether the typed identity matches the person at the tablet — so it permits post-hoc review of *anomalies you already suspect*, but provides zero anomaly *detection*. The risk is accepted as part of Increment 2's prototype-grade security posture and resolves only when GEN-2 (authentication) lands. Operational consequence under the planning-tool framing (see Design Philosophy): inspector-fraud degrades planning data mildly (one bad signoff can mean one chute reached Ready without a real second inspection) but does not collapse the planning value — the math, queue depth, and capacity signals all still work.
