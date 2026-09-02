---
validationTarget: '_bmad-output/planning-artifacts/prd.md'
validationDate: '2026-05-19'
inputDocuments:
  - '_bmad-output/project-context.md'
  - '.readme'
  - 'backend/dataflow.readme'
  - 'backend/erd.dbdiagram'
validationStepsCompleted: ['step-v-01-discovery', 'step-v-01-elicitation-devils-advocate', 'step-v-02-format-detection', 'step-v-03-density-validation', 'step-v-04-brief-coverage-validation', 'step-v-05-measurability-validation', 'step-v-06-traceability-validation', 'step-v-07-implementation-leakage-validation', 'step-v-08-domain-compliance-validation', 'step-v-09-project-type-validation', 'step-v-10-smart-validation', 'step-v-11-holistic-quality-validation', 'step-v-12-completeness-validation', 'step-v-13-report-complete']
validationStatus: COMPLETE
overallStatus: 'Pass with Recommendations'
preliminaryFindingsCount: 9
formatClassification: 'BMAD Standard'
coreSectionsPresent: 6
densitySeverity: 'Pass'
densityViolations: 0
briefCoverage: 'N/A'
measurabilitySeverity: 'Pass'
measurabilityViolations: 1
totalRequirementsAnalyzed: 60
traceabilitySeverity: 'Pass'
traceabilityIssues: 0
orphanFRs: 0
leakageSeverityStrict: 'Warning'
leakageSeverityBrownfield: 'Pass'
leakageViolationsStrict: 6
leakageViolationsBrownfield: 1
domainComplianceSeverity: 'Pass'
domainComplianceFraming: 'operational (per memory:plims-product-framing)'
projectTypeComplianceSeverity: 'Pass'
projectTypeComplianceScore: '100%'
smartSeverity: 'Pass'
smartFlaggedFRs: 0
smartAverageScore: 4.74
smartPerfectFRs: 23
holisticRating: '4/5 - Good'
bmadPrinciplesMet: '7/7'
dualAudienceScore: 4.5
completenessSeverity: 'Pass'
completenessPercent: '100%'
templateVariablesRemaining: 0
---

# PRD Validation Report

**PRD Being Validated:** `_bmad-output/planning-artifacts/prd.md`
**Validation Date:** 2026-05-19
**Validator:** John (Product Manager) — BMad Validation Architect

---

## Executive Summary

**Overall Status:** ✅ **Pass with Recommendations**
**Holistic Quality Rating:** **4/5 — Good**

The PRD passes every formal BMad validation check. It is structurally complete, dense in signal, traceable end-to-end, and exhibits unusual discipline for a brownfield PRD (zero subjective adjectives across 60 requirements, zero orphan FRs, zero anti-pattern violations). It is held back from a 5/5 rating by **two unresolved architectural decisions** (DA-1 inspector vs rigger labor pool, DA-2 time-in-stage architecture) that should be resolved before code lands — these are not document-quality issues per se but substantive product/architecture concerns the doc has not yet closed out.

### Quick Results

| Check | Severity | Score / Detail |
|---|---|---|
| Format Classification | **BMAD Standard** | 6/6 core sections + 4 BMAD-aligned extras |
| Information Density | **Pass** | 0 anti-pattern violations |
| Product Brief Coverage | **N/A** | No formal brief; 3 informal specs |
| Measurability | **Pass** | 1 issue (NFR-S6 narrative) across 60 requirements |
| Traceability | **Pass** | 0 orphan FRs; explicit Journey Requirements Summary table |
| Implementation Leakage (brownfield) | **Pass** | FRs 100% clean; NFR leakage is brownfield-appropriate |
| Domain Compliance | **Pass** | Operational framing per memory:[[plims-product-framing]] |
| Project-Type Compliance | **Pass** | 100% (5/5 required sections present or properly excluded) |
| SMART Quality | **Pass** | Avg 4.74/5.0 across 32 FRs; 0 flagged; 72% perfect |
| Holistic Quality | **Good** | 4/5; 7/7 BMAD principles met; dual-audience 4.5/5 |
| Completeness | **Pass** | 100%; 0 template variables; 3 honest open-question markers |

### Critical Issues

**0** — no critical-severity findings.

### Warnings

**0** under brownfield-aware interpretation; **1** under strict implementation-leakage rubric (6 brownfield anchors in NFR-S/O sections).

### Preliminary Devil's-Advocate Findings (Pre-Validation Sharpening)

9 findings (DA-1 through DA-9) surfaced during step-v-01 elicitation, ordered by severity under operational-planning framing:

| # | Finding | Severity |
|---|---|---|
| DA-1 | Inspector capacity math may double-count shared labor pool | HIGH |
| DA-2 | Time-in-stage columns incompatible with Growth rework path | HIGH |
| DA-3 | Polling cadence (5–10s) contradicts Journey 3 "real-time" UX | MEDIUM |
| DA-4 | NFR-R1 invariant breaks pre-Increment-2 ready inventory | MEDIUM |
| DA-5 | 6 success metrics unverifiable by their stated measurement method | MEDIUM |
| DA-6 | Inspection Workload view "surface, don't editorialize" is naive | MEDIUM |
| DA-7 | 15-second signoff target has no provenance | LOW |
| DA-8 | No timeline commitment | LOW |
| DA-9 | Inspector identity capture without auth — mitigation story is weak | LOW (under operational lens) |

(Originally there were 10; DA-1's predecessor — questioning the operational-vs-audit framing — was withdrawn after Jake confirmed the framing is product-correct, captured in memory: [[plims-product-framing]].)

### Strengths

- **Operationally vivid user journeys** with names, times, edge cases, and explicit capability mapping.
- **Three-layered out-of-scope hygiene** ("does NOT cover" / "not silently re-scoping" / "what handoff team should NOT assume").
- **Explicit traceability** via Journey Requirements Summary table — rare and load-bearing.
- **Brownfield discipline:** FR section is 100% clean of implementation leakage; NFR brownfield anchors are testable.
- **100% measurable requirements** apart from NFR-S6, which is a structural placement issue (belongs in Known Risks).

### Top 3 Improvements

1. **Resolve DA-1** (inspector vs rigger labor pool) with Senior NCO during the planned interview. Highest leverage: directly affects whether the product's core math is correct.
2. **Resolve DA-2** (time-in-stage architecture) via a 30-minute architecture call before code lands. Pick columns or transition log; current choice is incompatible with announced Growth rework.
3. **Move NFR-S6 to a Known Risks section** and merge with DA-9. Five-minute structural cleanup that removes the only formal Measurability violation.

### Recommendation

**PRD is in good shape. Address DA-1 and DA-2 (the substantive product/architecture decisions), then batch the polish items (NFR-S6 placement, FR wording tightening, section-overlap trims) in the edit phase.** The PRD is fit for moving to UX design and architecture work as soon as DA-1's labor-pool question is resolved; downstream artifacts depend on knowing whether inspector capacity is a parallel or shared constraint.

---

## Input Documents

- `_bmad-output/planning-artifacts/prd.md` — PRD under validation (Increment 2: Inspection Workflow UI + Planning-Time Risk Surfacing)
- `_bmad-output/project-context.md` — Tech stack, domain invariants, critical implementation rules (loaded as persistent fact)
- `.readme` — Original project brief (PLIMS system overview, MVP-1 spec)
- `backend/dataflow.readme` — Data flow documentation (system architecture, business logic layer, API endpoints)
- `backend/erd.dbdiagram` — Database schema (entities, relationships, enums)

## Validation Findings

### Preliminary Devil's-Advocate Findings (Pre-Validation Pass)

_Surfaced via `bmad-advanced-elicitation` → Challenge from Critical Perspective during step-v-01-discovery. These are starting hypotheses for the formal validation pass to confirm, refine, or dismiss — not final findings. Ordered by severity under PLIMS's operational-planning framing (see memory `plims-product-framing`)._

#### DA-1 — Inspector capacity math may double-count shared labor (HIGH)

**Where:** FR13, FR14; Success Criteria → Technical Success ("Inspector capacity computed alongside rigger capacity"); Inspector-capacity risk mitigation row.

**Claim under attack:** *"total daily inspection capacity based on active inspector count and inspection-per-day cap, mirroring rigger-capacity"* — modeled as a separate constraint from rigger capacity.

**Attack:** Journey 2 reads *"CPL Vasquez has been pulled off packing to do inspections for the day."* The ERD shows `users.role` as a single enum value per user — but if inspectors are riggers wearing a different hat on a given day, then inspector-hours and rigger-hours come out of the *same* time budget. Computing them as parallel parallel constraints in `Feasibility` will overcount available labor. The PRD doesn't define whether `role` is exclusive or whether the same person can pack one day and inspect the next. This is a math error — the most damaging possible finding for a planning tool.

**To resolve in validation:**
- Confirm the operational rule with Senior NCO (open question add): is inspection labor a *shared* pool with rigging or a *separate* pool?
- If shared: redesign FR13/FR14 to model labor as a single pool with role-of-day assignments.
- If separate: explicitly state it in the Domain-Specific Requirements section and justify why MVP-1 doesn't already do this.

---

#### DA-2 — Time-in-stage stored as columns is incompatible with the Growth rework path (HIGH)

**Where:** Success Criteria → Technical Success (timestamp-columns decision, with the explicit rejection of a transition-log alternative); Growth Features list (inspection rejection/rework).

**Claim under attack:** *"Time-in-stage tracking captured via per-stage timestamp columns on `parachutes` (`packed_at`, `initial_inspected_at`, `final_inspected_at`). An architectural alternative — a stage-transition log table — is rejected for Increment 2 because the framing is operational, not audit."*

**Attack:** If a chute goes Packed → Initial → *rejected* → Unpacked → Packed → Initial → Final, the timestamp columns will be overwritten on the second pass, losing the first-pass duration. Median time-in-stage becomes incomputable for any chute that has ever been rejected. The "we'll add rework in Growth" promise quietly requires a schema redo. The transition-log rejection rationale ("framing is operational, not audit") confuses *audit logging* with *operational metric storage* — a log table is the right shape for the planning metric, not the wrong shape.

**To resolve in validation:**
- Reconsider the columns-vs-log decision now, before MVP migration ships.
- If columns retained: explicitly scope median-time-in-stage to "chutes with zero rejections" and document the carve-out.
- If log adopted: revise the Technical Success bullet and the open-question reference.

---

#### DA-3 — Polling cadence (5–10s) contradicts "real-time" UX in Journey 3 (MEDIUM)

**Where:** NFR-P6 (polling default); Journey 3 (*"watches the planner-facing inventory counter tick up in real time"*); Web Application Specific Requirements → Real-Time Strategy.

**Claim under attack:** The doc claims polling at 5–10s satisfies the journey's real-time perception.

**Attack:** A 5–10 second poll is not perceptually real-time on a projected dashboard. The acceptance bar ("the user perceives 'the system rechecked'") papers over the perceptual gap. Options unexplored: Server-Sent Events (one-way push, lighter than websockets, not banned by project-context.md framework-deps rule), a tighter poll cadence (~1s with bounded subset of fields), or rewriting Journey 3 to be honest about cadence.

**To resolve in validation:**
- Confirm with Senior NCO whether "tick up in real time" is a literal perception need or narrative shorthand.
- Either tighten the cadence, pick SSE, or revise Journey 3.

---

#### DA-4 — NFR-R1 invariant breaks pre-Increment-2 ready inventory (MEDIUM)

**Where:** NFR-R1 (*"No chute can reach `status: ready` without `packer_id`, `initial_inspector_id`, `final_inspector_id` all non-null and distinct"*); NFR-O3 (migration backfill); Technical Risks row on schema migration backfill.

**Claim under attack:** The invariant is stated absolutely.

**Attack:** MVP-1 has chutes today with `status: ready` and `last_pack_date` set but with the new inspector columns about to backfill to NULL. The invariant as written makes every existing ready chute illegal the moment the migration runs. The backfill mitigation says "handles existing rows" but doesn't specify *how* the new inspector columns get values (sentinel UUID? a "legacy" pseudo-user? NULL with a carve-out?). The PRD writes an invariant the data violates.

**To resolve in validation:**
- Specify the backfill rule for pre-Increment-2 ready chutes.
- Restate NFR-R1 with the temporal qualifier: *"For any chute that enters the inspection workflow after Increment 2 migration runs..."* — or grandfather pre-existing rows explicitly.

---

#### DA-5 — Six success metrics are unverifiable by their stated measurement method (MEDIUM)

**Where:** Measurable Outcomes table.

**Examples:**
- *"Lead time on red-flag events seen by Senior NCO ≥ 14 days median — Audit-log spot check"* — no impression-tracking audit log is defined in MVP scope.
- *"Inspection signoff time (median) < 15 seconds — Manual timing during UAT"* — UAT timing has high observer effect; single-shift sample is not a median.
- *"0 MVP-1 endpoint regression count — Smoke-curl pre/post"* — single-sample curls are not regression testing.
- *"Inspection queue depth visible to NCO in one click — UAT walkthrough"* — binary yes/no, not a metric.
- *"Events flagged 'infeasible: inspector short' surfaced distinctly — UAT walkthrough"* — same binary issue.
- *"Median time-in-stage ≤ N days — DB query"* — N is undefined (IW-5) and per DA-2 the underlying data may be incomputable.

**Attack:** These read like quantitative metrics but cannot be measured as listed. Either fix the measurement method or downgrade to acceptance criteria (boolean) and stop calling them metrics.

**To resolve in validation:**
- For each row: rewrite the measurement method to something the MVP actually produces, OR convert to a yes/no acceptance check, OR remove.

---

#### DA-6 — Inspection Workload view's "surface, don't editorialize" stance is naive (MEDIUM)

**Where:** Adoption Risks table (*"Inspector workload imbalance becomes visible and creates interpersonal friction... Surface the data, don't editorialize"*); FR8 (*"per-inspector workload counts"*).

**Attack:** The choice to display per-person inspection counts side by side IS an editorial act. The PRD pretends the system is neutral by declining to add "performance ratings or color-coded shaming" — but a leaderboard is a leaderboard whether or not it has stars. Two viable paths the PRD doesn't consider:
1. Show per-shift or per-role aggregates, not per-person — preserves planning value, removes the comparison.
2. Show per-person counts but gate the view to Senior NCO only — preserves planning value, removes ambient social pressure on the floor.

**To resolve in validation:**
- Decide whether FR8 stays as-is, aggregates, or gates by role.
- Document the tradeoff explicitly in Risk Mitigation rather than denying it.

---

#### DA-7 — 15-second signoff target has no provenance (LOW)

**Where:** Success Criteria → User Success (*"fewer than 15 seconds, screen-load to confirmation"*); Measurable Outcomes table; NFR-P1.

**Attack:** Journey 2 says "11 seconds on the tablet" — narrative number. The 15-second target is never traced to Senior NCO input or to an operational baseline. Looks PM-invented despite the PRD's own warning elsewhere: *"Do not invent values."*

**To resolve in validation:**
- Mark 15s as a placeholder pending the Senior NCO interview, OR cite the journey's 11s as the source and explain the 36% buffer, OR remove the precise number and keep the principle.

---

#### DA-8 — No timeline commitment (LOW)

**Where:** Resource Requirements (team-size assumption present); no schedule anywhere in the doc.

**Attack:** The handoff team can't sequence Epic A → Epic B, set a milestone, or de-risk slippage without a target date. "Phased release mode" is described philosophically but no calendar anchors exist.

**To resolve in validation:**
- Add a target-date or weeks-to-MVP commitment to the Resource Requirements section, OR explicitly state that scheduling is out of PRD scope and call out who owns it (the handoff team's intake meeting, presumably).

---

#### DA-9 — Inspector identity capture without auth — mitigation story is weak (LOW under operational lens)

**Where:** NFR-S6 (*"acknowledged weakness"*); NFR-S3 (*"all inspector signoff events are recorded with their timestamp and the identity-as-captured"*); Domain-Specific Risks table row 1.

**Attack:** Without auth, an inspector can sign as any other. NFR-S3 captures only *what was typed* — it cannot detect a fraudulent entry, only review one if you already suspect. The mitigation provides zero anomaly-detection capability for the most likely fraud (one inspector clicking through queue under a friend's identity to clear backlog).

Under the operational-planning lens (see memory `plims-product-framing`), this is **lower severity than it would be under an audit lens** — operational planning is degraded mildly if an inspector frauds, but not collapsed. Still worth honest naming.

**To resolve in validation:**
- Rewrite NFR-S6 to say plainly: *"There is no mitigation for inspector-identity fraud in Increment 2. The risk is accepted as part of prototype-grade security posture and is fully resolved only when GEN-2 (auth) lands."*

---

**End of preliminary findings. Step-v-02 (Format Detection) and downstream validation steps will confirm, refine, or dismiss each of DA-1 through DA-9.**

---

## Format Detection

**PRD Structure (## Level 2 headers, in order):**
1. Executive Summary
2. Project Classification
3. Success Criteria
4. Product Scope
5. Project Scoping & Phased Development
6. User Journeys
7. Domain-Specific Requirements
8. Web Application Specific Requirements
9. Functional Requirements
10. Non-Functional Requirements

**BMAD Core Sections Present:**
- Executive Summary: **Present**
- Success Criteria: **Present**
- Product Scope: **Present**
- User Journeys: **Present**
- Functional Requirements: **Present**
- Non-Functional Requirements: **Present**

**BMAD-Aligned Extras (beyond core six):**
- Project Classification (frontmatter-style metadata table — light overlap with frontmatter `classification:` block, candidate for density review in step-v-03)
- Project Scoping & Phased Development (MVP/Growth/Vision philosophy + Resource Requirements + Risk Mitigation tables — substantive, not boilerplate)
- Domain-Specific Requirements (Operational Rules tables — appropriate given defense-logistics domain)
- Web Application Specific Requirements (project-type section — appropriate per the PRD purpose standard)

**Format Classification:** **BMAD Standard**
**Core Sections Present:** **6/6**

**Notes for downstream validation:**
- Frontmatter `classification.audience: 'handoff-team'` and `releaseMode: 'phased'` align with the body content.
- The two extra sections most likely to attract density-validation findings are **Project Classification** (information overlaps frontmatter) and possibly **Web Application Specific Requirements** (some duplication of NFR-P / NFR-A content via cross-reference).
- Section ordering matches the BMAD canonical sequence (Executive Summary → Success → Scope → Journeys → Domain → Project-Type → FRs → NFRs).

---

## Information Density Validation

**Document size:** 511 lines / 7,498 words.

**Anti-Pattern Violations:**

**Conversational Filler:** 0 occurrences
- Scanned: `The system will allow users to`, `It is important to note that`, `In order to`, `For the purpose of`, `With regard to` → all zero.

**Wordy Phrases:** 0 occurrences
- Scanned: `Due to the fact that`, `In the event of`, `At this point in time`, `In a manner that` → all zero.

**Redundant Phrases:** 0 occurrences
- Scanned: `Future plans`, `Past history`, `Absolutely essential`, `Completely finish` → all zero.

**Total Violations:** 0

**Severity Assessment:** **Pass**

**Advisory Observations (not formal anti-pattern violations):**

These are not violations under the BMAD anti-pattern rubric, but flagged for the edit phase since Jake's stated focus includes "tighten information density":

- **"actually"** appears 3× (lines 338, 339, 345) — each in legitimate emphasis ("doesn't actually exist," "aren't actually achievable," "actually operates"). All defensible.
- **"just"** appears 7× (lines 58, 80, 95, 103, 172, 272, 448) — each as a semantically loaded contrast ("not just procedural," "not just rigger throughput," "PLIMS just told him..."). All defensible.
- **Section overlap candidates for editorial tightening** (raise in edit phase, not validation):
  - **Project Classification** (lines 60–70) overlaps with frontmatter `classification:` block — consider folding into Executive Summary or removing if frontmatter suffices.
  - **Web Application Specific Requirements → Performance Targets / Accessibility** (lines 376, 380) cross-reference NFR-P / NFR-A. Cross-references are fine, but the surrounding prose duplicates the *intent* of those NFRs ("Accessibility bar is calibrated to a small, known user pool" restates NFR-A5's spirit).
  - **Design Philosophy** (lines 56–58) and **What Makes This Special** (lines 50–54) both argue the "inspection as throughput, not compliance" thesis. One paragraph could absorb the other.
  - **Project Scoping & Phased Development → MVP Strategy & Philosophy** (lines 161–177) repeats material already in Product Scope. Could be a one-paragraph cross-reference instead of a sub-section.

**Recommendation:** PRD demonstrates **good information density** with zero formal anti-pattern violations. The doc is verbose by sheer line count (511 lines) but most prose carries weight. For edit-phase tightening, the highest-leverage moves are the four section-overlap candidates above — collectively they could trim ~30–50 lines without losing signal.

---

## Product Brief Coverage

**Status:** **N/A — No formal Product Brief was provided as input.**

PRD frontmatter declares `briefs: 0, informalSpecs: 3`. The three informal specs (`.readme`, `dataflow.readme`, `erd.dbdiagram`) function as a brownfield equivalent — the original project brief is captured in `.readme` and the data-flow / schema docs codify the MVP-1 already-shipped state.

**Note for downstream review:** A brief-coverage pass over `.readme` is possible but was not requested. If desired, it can be run as a one-off cross-document consistency check (the Self-Consistency Validation method from the elicitation registry). The devil's-advocate findings DA-1 through DA-9 already touch several `.readme` ↔ PRD intersections (notably DA-1 around the `role` enum from `erd.dbdiagram`).

---

## Measurability Validation

### Functional Requirements

**Total FRs Analyzed:** 32 (FR1 – FR32)

**Format Violations:** 0
- All FRs follow either "[Actor] can [capability]" (FR1–FR12, FR17, FR19–FR20, FR23) or "The System [verb] [capability]" (FR4, FR10–FR11, FR13–FR18, FR22, FR25–FR27) — both valid BMAD patterns.

**Subjective Adjectives:** 0
- Mechanical scan for `easy / fast / simple / intuitive / user-friendly / responsive / quick / efficient / seamless / smooth` returned zero matches inside the FR section.

**Vague Quantifiers:** 0
- Mechanical scan for `multiple / several / some / many / few / various` returned zero matches inside the FR section.

**Implementation Leakage:** 0
- No technology names, library names, or framework references appear in FR statements. (NFRs do reference implementation files — see NFR section below — but FRs are clean.)

**FR Violations Total:** **0**

**Soft observations (not formal violations, but flagged for edit phase):**

- **FR8 / FR16 / FR18** use the word "configurable" without specifying the configuration boundary (range, default, who configures, where). Acceptable but tighter would be: *"configurable between [N1 and N2] days, default N"*.
- **FR13 / FR14** depend on two undefined constants — *"inspection-per-day cap"* and *"inspections-per-chute"*. The latter is implicitly 2 (initial + final) but the PRD never names that value. This is the same gap **DA-1** flagged from a different angle (capacity-math correctness); the measurability angle is that an FR referencing an unnamed constant cannot be fully tested.

### Non-Functional Requirements

**Total NFRs Analyzed:** 28
- Performance: 6 (NFR-P1 – NFR-P6)
- Security: 6 (NFR-S1 – NFR-S6)
- Reliability: 5 (NFR-R1 – NFR-R5)
- Accessibility: 5 (NFR-A1 – NFR-A5)
- Operability: 6 (NFR-O1 – NFR-O6)

**Missing Metrics:** **1**

- **NFR-S6** (line 486) is a narrative acknowledgment of a known security weakness, not a testable NFR. It reads *"Acknowledged weakness: inspector identity is captured via UI selection without authentication..."* — there is no metric, no condition, no measurement method. It belongs in a Known Risks / Acknowledged Weaknesses section, not as a numbered NFR. **(Cross-link: DA-9 attacks the substance of this same statement — the mitigation story is weak. Both findings point to the same line; combine them in the edit phase.)**

**Incomplete Template:** 0
- All other NFRs include criterion + metric + condition + measurement method or domain context. NFR-P series specify percentile + budget + environment. NFR-A series specify standard (WCAG 2.1 AA) + concrete pixel/contrast targets. NFR-R series specify invariants or behaviors with testable acceptance.

**Missing Context:** 0
- Each NFR contextualizes why it matters or who it affects.

**NFR Violations Total:** **1**

**Soft observations (not formal violations, but flagged for edit phase):**

- **NFR-S5** references `app.use(cors())` by name — mild implementation leakage in an NFR. Could read *"CORS remains origin-permissive"* without the code citation. Defensible (brownfield PRD references actual files elsewhere) but inconsistent with the FR-section discipline.
- **NFR-O5** is a scope-exclusion statement (*"No automatic backup of the production DB is in scope..."*), not a testable operability requirement. Belongs in Product Scope's "out of scope" list, not in the NFR section.
- **NFR-A5** is also a non-target acknowledgment (*"Full screen-reader support is NOT a target"*) — but it's clearly framed as an explicit non-target, which BMAD allows. Acceptable as-is.
- **NFR-P6**'s polling-cadence default *"every 5–10 seconds"* is a range rather than a single value. Acceptable (the range is the spec) but worth pinning to a single default if the cadence becomes contentious during build. **(Cross-link: DA-3 attacks the cadence as too slow for Journey 3's "real-time" UX.)**

### Overall Assessment

**Total Requirements:** 60 (32 FRs + 28 NFRs)
**Total Formal Violations:** **1** (NFR-S6 not measurable as an NFR)

**Severity:** **Pass** (< 5 violations on the formal rubric)

**Recommendation:** Requirements demonstrate **strong measurability** with one formal issue and four soft observations. The PRD's authors maintained admirable discipline — zero subjective adjectives across 60 requirements is rare. The edit phase should:

1. Move NFR-S6 to a Known Risks section (and merge with DA-9).
2. Move NFR-O5 to Product Scope → out of scope.
3. Define the constants behind FR13/FR14 ("inspections-per-chute = 2") so the requirements are fully self-contained (resolves the measurability angle of DA-1).
4. Tighten "configurable" references in FR8/FR16/FR18 with explicit bounds.
5. Optionally de-leak NFR-S5's `app.use(cors())` to plain prose.

---

## Traceability Validation

### Chain Validation

**Executive Summary → Success Criteria:** **Intact**
- Vision (*"inspection labor as a first-class scheduling constraint"*) flows directly into all three success dimensions (User / Operational / Technical).
- Each named user role in the Executive Summary (Senior NCO, Inspectors, Riggers, audit-time reviewers) has a corresponding success-criteria block — except audit-time reviewers, which is intentionally consistent with the operational-not-audit framing (memory: [[plims-product-framing]]).

**Success Criteria → User Journeys:** **Intact**
- Inspector criteria → Journey 2 (Vasquez), Journey 3 (Chen).
- Rigger criteria → Journey 1 (Doe).
- Senior NCO criteria → Journey 4 (Riley).
- Operational success bullets (queue depth, inspector capacity, time-in-stage budget, lead time on red flags, zero silent infeasibility) all have direct or edge-case journey coverage. Journey 4's "silent shift" edge case explicitly demonstrates the zero-silent-infeasibility criterion.

**User Journeys → Functional Requirements:** **Intact**
- The PRD provides an explicit Journey Requirements Summary table (lines 284–298) mapping capabilities to journeys and epics. The table is honest — spot-checked all 13 capability rows against the FR list:
  - Inspection Queue → FR5 ✓
  - "My Packs / My Inspections" → FR6, FR7 ✓
  - One-tap stage advance with identity → FR2, FR3, FR9 ✓
  - Distinct-person rule → FR10, FR11 ✓
  - Auto-transition final → ready with inventory update → FR4, FR26 ✓
  - Inspection Workload view → FR8 ✓
  - Age-in-stage tracking → FR16, FR17 ✓
  - Calendar red flag with reason breakdown → FR19, FR20 ✓
  - Planning Health panel → FR23 ✓
  - Per-event feasibility detail view → FR20 ✓
  - Automatic re-feasibility on availability changes → FR22 ✓
  - Persistent red-flag state → FR21 ✓
  - Inspector capacity in business logic → FR13, FR14, FR15 ✓

**Scope → FR Alignment:** **Intact**
- Epic A MVP items (schema migration, state-advance endpoints, distinct-person enforcement, auto-transition, inspector capacity in business logic, Inspection Queue UI panel, identity dropdown) → FR1–FR18.
- Epic B MVP items (Planning Health panel with 30/90/180-day windows, calendar persistent red flag, feasibility re-runs on data changes) → FR19–FR25.
- Live data surfaces → FR26–FR27.
- Regression guards → FR28–FR32.

### Orphan Elements

**Orphan Functional Requirements:** **0**
- Every FR (FR1–FR32) traces back to at least one user journey, success criterion, or scoping decision.

**Unsupported Success Criteria:** **0**
- Every success-criteria bullet has at least one FR or NFR enabling it.

**User Journeys Without FRs:** **0**
- All four journeys are fully covered by the FR list, as confirmed by the PRD's own Journey Requirements Summary table.

### Traceability Matrix Summary

| Source Layer | Elements | Downstream Coverage | Status |
|---|---|---|---|
| Executive Summary | 3 personas, 2 epics, 5 out-of-scope items | All landed in Success Criteria | Intact |
| Success Criteria | 7 user-success bullets + 6 operational + 7 technical + 7 measurable outcomes | All map to journeys, FRs, or NFRs | Intact |
| User Journeys | 4 journeys, 13 distinct capabilities | All 13 capabilities → 18 distinct FRs | Intact |
| Functional Requirements | 32 FRs | 100% traceable upstream | No orphans |
| Product Scope MVP | Epic A + Epic B items | 100% covered by FRs | Intact |

### Soft Observations (not formal violations)

- **FR27** (polling cadence refresh) traces primarily through NFR-P6 (which sets the cadence) and Journey 3 (which implies near-real-time feel). The chain is intact but goes via NFR rather than directly via Journey — acceptable for a behavior NFR-derived from a UX expectation, but flagged because **DA-3** attacks the cadence as too slow for Journey 3's "real-time" UX. Either tighten the cadence (FR27 stays) or rewrite Journey 3 (FR27 may need wording adjustment).
- **Success Criterion "Lead time on red flags ≥ 14 days median"** is an emergent property of FR21 (persistent red-flag) + FR22 (re-evaluation) rather than a directly-enabled capability. The PRD's measurement method (*"Audit-log spot check"*) compounds the issue — **DA-5** already flagged this as unverifiable. Cross-link.

**Total Traceability Issues:** **0** formal issues. 2 soft observations cross-link to existing devil's-advocate findings.

**Severity:** **Pass**

**Recommendation:** Traceability chain is **fully intact**. The PRD's explicit Journey Requirements Summary table (lines 284–298) was clearly authored with traceability in mind — it makes the chain visible and verifiable in the doc itself, which is a BMAD best practice. No edit-phase action required for traceability proper. The two soft observations resolve through existing devil's-advocate findings (DA-3 and DA-5), not through traceability-specific rewrites.

---

## Implementation Leakage Validation

**Critical framing note:** The PRD frontmatter declares `projectMode: 'brownfield'`. In brownfield PRDs, references to existing files, code symbols, scripts, and infrastructure are not always leakage — they're frequently *anchors* that make NFRs testable against the existing system. Both the strict-rubric and brownfield-aware verdicts are reported below.

### Leakage by Category

**Frontend Frameworks:** 0 violations
- No React/Vue/Angular/Next/Vite references in FR or NFR sections.

**Backend Frameworks:** 0 violations
- No Express/Django/Rails references in FR or NFR sections.

**Databases:** 0 violations
- No PostgreSQL/MySQL/MongoDB/Redis references in FR or NFR sections. (NFR-R3, NFR-R4 say "DB" generically.)

**Cloud Platforms:** 0 violations

**Infrastructure (brownfield anchors):** 3 references — all brownfield-appropriate
- **NFR-S4** (line 484): names `docker-compose.yml` and `knexfile.ts` to specify where the default credentials live (testable as "is the credential overridden?"). Brownfield-necessary.
- **NFR-O3** (line 508): `npm run dev:migrate` — the script the migration must be compatible with. Brownfield-necessary.
- **NFR-O6** (line 511): `docker-compose up` — the cold-start acceptance procedure. Brownfield-necessary.

**Libraries (brownfield anchors):** 3 references — mixed
- **NFR-A4** (line 501): "Shadcn theme defaults are compliant" — brownfield reference to the existing UI library; the NFR sets the contrast target *and* says the existing theme already meets it. Brownfield-appropriate.
- **NFR-O1** (line 506): `console.log` / `console.error` / `winston` / `pino` — describes the logging discipline as "use the existing console pattern; do not introduce structured loggers." This is **discipline guidance** rather than capability spec. **Edit-phase candidate:** could move to project-context.md (where similar rules live) and replace in NFR-O1 with a plainer "log significant state changes at info/error level."
- **NFR-S5** (line 485): `app.use(cors())` — same pattern as NFR-O1; already flagged in Measurability soft observations.

**Data Formats:** 0 violations

**Protocol References (capability-relevant):** 2 references — all acceptable
- **NFR-R4** (line 493): "HTTP 5xx with body `{ error: 'message' }`" — describes the testable response shape. The HTTP status code class IS the capability spec.
- **NFR-O2** (line 507): "HTTP 500 on DB connectivity failure" — same. Capability-relevant.

**Other Implementation Details:** 1 reference
- **NFR-R5** (line 494): "each view fetch reads from the API" — "fetch" used as a semantic verb here, not the `fetch()` API. Acceptable.

### Summary

| Verdict | Strict BMAD Rubric | Brownfield-Aware |
|---|---|---|
| Frontend framework leakage | 0 | 0 |
| Backend framework leakage | 0 | 0 |
| Database leakage | 0 | 0 |
| Cloud platform leakage | 0 | 0 |
| Infrastructure leakage | 3 (NFR-S4, NFR-O3, NFR-O6) | 0 (brownfield anchors, all testable) |
| Library leakage | 3 (NFR-A4, NFR-O1, NFR-S5) | 1 (NFR-O1 is discipline guidance, not capability) |
| Protocol/format leakage | 0 (HTTP class names are capability) | 0 |
| **Total** | **6** | **1** |

**Strict severity:** Warning (5–10 violations bucket) — would say *"some implementation leakage detected"*.
**Brownfield-aware severity:** **Pass** (<2 violations).

**Most important finding:** **FR section (FR1–FR32) is 100% clean of leakage** under either interpretation. This is the section where leakage matters most — capabilities should specify WHAT, not HOW — and the PRD's authors held that line. The leakage all lives in the NFR-S / NFR-O bands where brownfield anchoring is operationally necessary to make the NFR testable.

**Recommendation:** **No critical leakage rework needed.** For the edit phase:

1. **NFR-O1**: refactor to remove the `winston/pino/console.log` discipline guidance — that belongs in `project-context.md` (where it already lives). Keep the NFR focused on the testable behavior ("at least one log entry per state change including entity ID and actor identity"). This is the cleanest single-shot improvement.
2. **NFR-S5**: de-leak `app.use(cors())` to plain prose ("CORS remains origin-permissive"). Already noted in Measurability findings.
3. **NFR-S4 / NFR-O3 / NFR-O6 / NFR-A4**: leave as brownfield anchors. These are necessary for the NFR to be testable, and stripping them would weaken the spec.

**Note:** This PRD's leakage profile is unusually well-disciplined. Many brownfield PRDs leak heavily through FR descriptions ("display this React component..."). PLIMS's PRD pushed all implementation references into the NFR section, where the brownfield framing actually makes them defensible.

---

## Domain Compliance Validation

**Domain:** `defense_logistics` (per PRD frontmatter `classification.domain`)

**Domain-Complexity Lookup:** The BMAD domain-complexity rubric does not list `defense_logistics` explicitly. The nearest analogs in the rubric are:
- `aerospace` (high complexity) — parachutes are aerospace safety equipment; DO-178C, ITAR, performance validation, safety certification.
- `govtech` (high complexity) — defense is public-sector adjacent; procurement, security clearance, FedRAMP, Section 508.

Under either analog, this PRD would normally be classified **high complexity** and required to carry a regulatory-pathway section.

**However** — and this is the load-bearing finding — the PRD makes a deliberate, explicit scope choice: it is an **operational planning tool**, not a compliance/audit/regulatory artifact. Memory [[plims-product-framing]] confirms this is the product's intent (per Jake, 2026-05-19), and the PRD's Design Philosophy section names it: *"PLIMS Increment 2 is not a technical novelty. It is a deliberate reframe: inspection labor is a first-class scheduling constraint, not a compliance afterthought."* The PRD also names "Operational lens" in the Project Classification table.

This makes the standard high-complexity compliance checklist (DO-178C, ITAR, FedRAMP, Section 508, FAR, DoD 5000.x, Army Regulation 750-32 for parachute maintenance) **out of scope by design**, not missing by oversight.

### Domain-Specific Sections — What the PRD Does Include

| Section | Present | Adequacy |
|---|---|---|
| Operational Rules encoded today (180-day repack, 12-pack cap, M-F work week, same-day demand, two distinct inspectors, packer ≠ inspector) | ✅ Present | Adequate — sourced to "Army Rigger doctrine," located in `Inventory.getExpirationStatus` / `LaborMatrix.PACK_LIMIT` / `Feasibility.checkEventFeasibility` |
| Operational Rules NOT encoded (reserve-vs-main, inspector auth, empirical production logging) | ✅ Present | Adequate — each labeled "Where it goes" (Vision / GEN-2 / GEN-1) |
| Technical Constraints Imposed by the Domain (safety-critical equipment integrity, business-day vs calendar-day, date-format invariant) | ✅ Present | Adequate |
| Integration Requirements (no new external integrations, no SIPR/NIPR crossing, no external API consumption, no government data feeds) | ✅ Present | Adequate — by-design choice explicitly stated |
| Domain-Specific Risks & Mitigations (auth fraud, inspector pulls, surge-mode propagation, missing rework path, reserve mismatch) | ✅ Present | Adequate |
| "What the handoff team should NOT assume" (regulatory audit is not the validation gate, PLIMS is not the personnel SoR, reserve ≠ main) | ✅ Present | Strong — pre-empts the most likely scope creep |

### Sections the PRD Could Have Included But Did Not (by-design omissions, not gaps)

| Section | Why omitted |
|---|---|
| Regulatory pathway (DO-178C, AR 750-32, etc.) | Operational framing per memory [[plims-product-framing]] |
| ITAR / export-controls posture | Unit-internal deployment; no cross-border data, no foreign sales |
| Section 508 / accessibility regulatory baseline | NFR-A4 references WCAG 2.1 AA which subsumes the relevant 508 testable criteria; explicit non-targets (NFR-A5) are named |
| Procurement / acquisition compliance | This is a build PRD, not an acquisition PRD; appropriate omission |
| Audit-trail export / FOIA-readiness | Memory-confirmed operational framing; Inspection trail export is in Growth, not MVP |

### Compliance Matrix

| Requirement category | Status | Notes |
|---|---|---|
| Domain rules encoded in system | **Met** | Six operational rules captured, each traced to code location |
| Out-of-scope rules named explicitly | **Met** | Three rules named with reasons + future-increment routing |
| Safety-critical handling | **Met** | NFR-R1 (distinct-person invariant) + Domain section "safety-critical equipment integrity" + Technical Success bullet (server-side state-machine enforcement) |
| Regulatory frameworks referenced | **Intentionally Not Met** | Operational scope; framework references would be out of scope for Increment 2 |
| Audit trail | **Intentionally Deferred** | Inspection signoff records exist as a byproduct (NFR-S3); formal audit export is in Growth |

### Summary

**Required Sections Present:** 6/6 (under operational-domain interpretation)
**Compliance Gaps:** 0 by-design; 0 by-oversight
**Out-of-Scope Sections Named Explicitly:** 5

**Severity:** **Pass** (under PLIMS's documented operational framing)

**Cross-cutting risk note:** If the deployment surface ever expands beyond unit-internal (e.g., DoD-wide rollout, joint-service distribution, vendor procurement evaluation), this section would need to be revisited and likely expanded to include explicit regulatory-pathway content. For Increment 2's actual scope (one unit, operational planning), the current Domain-Specific Requirements section is **appropriate and complete**.

**Recommendation:** No edit-phase action required for domain compliance. The PRD has done the harder version of this work — it picked a framing, named the out-of-scope dimensions clearly, and traced the domain rules it does carry to specific code. The "What the handoff team should NOT assume" sub-section is particularly strong; preserve it intact.

---

## Project-Type Compliance Validation

**Project Type:** `web_app` (per PRD frontmatter `classification.projectType`)

**BMAD CSV Spec for `web_app`:**
- Required: `browser_matrix`, `responsive_design`, `performance_targets`, `seo_strategy`, `accessibility_level`
- Skip (should be absent): `native_features`, `cli_commands`

### Required Sections

| Section | PRD Location | Status | Notes |
|---|---|---|---|
| **browser_matrix** | Web App Spec Reqs → Browser & Device Support (lines 358–362) | **Partial** | Working assumption ("Chromium-based browser, Chrome / Edge on existing tablets and workstations") with explicit open question WAP-1 to confirm with Senior NCO. Acceptable as a known placeholder, but the open question must close before MVP ships. |
| **responsive_design** | Web App Spec Reqs → Responsive Design (lines 383–385) + Browser & Device Support (tablet ergonomics, 44×44pt tap targets, no hover-only) | **Present** | Adequate. Tablet (≥768px) and desktop (≥1024px) named as first-class; mobile (360px) explicitly out of scope with reason. |
| **performance_targets** | NFR-P1 – NFR-P6 (lines 470–475) + Web App Spec Reqs → Performance Targets cross-reference (line 376) | **Present** | Adequate. Six measurable targets with percentile + condition + environment. |
| **seo_strategy** | Web App Spec Reqs → SEO (lines 364–365) | **Intentionally Excluded** | "Not applicable — unit-internal application; not indexed; not crawled." Proper out-of-scope treatment with reason. |
| **accessibility_level** | NFR-A1 – NFR-A5 + Web App Spec Reqs → Accessibility (line 380) | **Present** | WCAG 2.1 AA cited concretely with pixel/contrast targets. Explicit non-targets (screen-reader, NFR-A5) named to prevent later misinterpretation. |

### Excluded Sections (Should NOT Be Present)

| Section | Status | Notes |
|---|---|---|
| **native_features** | **Absent** ✓ | Web App Spec Reqs → Explicit non-goals (line 389) names this directly: *"No native features — no PWA install, no service worker, no offline mode, no push notifications API."* Correct way to handle a skip-category. |
| **cli_commands** | **Absent** ✓ | Web App Spec Reqs → Explicit non-goals (line 390): *"No CLI / no scripting interface for this increment. (The backend npm scripts cover the dev/admin operations the handoff team needs.)"* Correct. |

### Compliance Summary

| Metric | Value |
|---|---|
| Required sections present | 4/5 fully Present + 1 Partial = **4.5/5** |
| Required sections intentionally excluded with reason | 1 (seo_strategy) — counts toward Present per BMAD convention |
| Excluded sections present (violations) | **0** |
| Compliance score | **100%** (5/5 required either present or properly excluded; 0 skip violations) |

**Severity:** **Pass**

**Recommendation:** Project-type compliance is **complete**. The only soft note is the `browser_matrix` placeholder (open question WAP-1) — this should close during the Senior NCO interview before MVP ships, but does not block validation today. The "Explicit non-goals" sub-section is doing meaningful work: it pre-empts the most likely scope-creep questions ("can we add a service worker?" "what about offline?" "should we support CLI access?") with named, reasoned answers. Preserve this pattern.

**No edit-phase action required for project-type compliance** beyond resolving WAP-1 during the planned Senior NCO interview.

---

## SMART Requirements Validation

**Total Functional Requirements:** 32 (FR1 – FR32)

### Scoring Summary

| Metric | Value |
|---|---|
| All scores ≥ 3 | **100%** (32/32 — zero FRs flagged) |
| All scores ≥ 4 | **96.9%** (31/32) |
| All scores = 5 | **71.9%** (23/32 perfect) |
| Overall average score | **4.74 / 5.0** |

### Scoring Table — FRs with any sub-5 score

(FRs not listed below received a perfect 5/5/5/5/5 = 5.0 and need no comment.)

| FR # | Specific | Measurable | Attainable | Relevant | Traceable | Avg | Notes |
|---|---|---|---|---|---|---|---|
| FR5 | 4 | 4 | 5 | 5 | 5 | 4.6 | "their scope" not defined as a filter or as a role-derived view |
| FR6 | 4 | 4 | 5 | 5 | 5 | 4.6 | "current shift" undefined — system likely means "today" |
| FR8 | 3 | 4 | 5 | 4 | 4 | 4.0 | "configurable time window" unbounded; cross-link DA-6 (editorial framing) |
| FR13 | 3 | 4 | 5 | 5 | 5 | 4.4 | "inspection-per-day cap" undefined constant; cross-link DA-1 |
| FR14 | 3 | 4 | 4 | 5 | 5 | 4.2 | "inspections-per-chute" undefined constant + capacity-math risk; cross-link DA-1 |
| FR18 | 3 | 3 | 3 | 5 | 5 | **3.8** | "configurable period" + median incomputable under rework; cross-link DA-2 |
| FR22 | 4 | 5 | 5 | 5 | 5 | 4.8 | "affected window" not bounded but implied by "draw date" |
| FR24 | 4 | 4 | 5 | 5 | 5 | 4.6 | "concrete context" subjective; example saves it |
| FR26 | 4 | 4 | 5 | 5 | 5 | 4.6 | "without requiring user to manually refresh" cadence-dependent; cross-link DA-3 |
| FR27 | 3 | 4 | 5 | 5 | 4 | 4.2 | "recurring cadence" vague; pinned only via NFR-P6 |
| FR28 | 5 | 3 | 4 | 5 | 5 | 4.4 | Verification method (smoke-curl pre/post) is weak; cross-link DA-5 |

**Perfect-score FRs (5.0 across all five SMART dimensions):** FR1, FR2, FR3, FR4, FR7, FR9, FR10, FR11, FR12, FR15, FR16, FR17, FR19, FR20, FR21, FR23, FR25, FR29, FR30, FR31, FR32 (and the inspection-state-machine + regression-guard families are uniformly strong).

**Legend:** 1 = Poor, 3 = Acceptable, 5 = Excellent. No FR scored below 3 in any category.

### Improvement Suggestions for Sub-5 FRs

Note: **No FR is formally flagged** (the SMART rubric flags only sub-3 scores). The suggestions below are for the edit phase to lift sub-5 FRs to a higher confidence band. Most resolve through existing devil's-advocate findings.

- **FR5 / FR6** — Define "scope" (FR5) and "current shift" (FR6) plainly: *"scope = chutes awaiting the stage the active inspector is authorized to clear"*, *"current shift = local-time current calendar day, configurable per deployment"*. Small wording change, no semantic shift.
- **FR8** — Replace "configurable time window" with a default + bounds: *"over a window between 1 and 90 days (default 7)."* Cross-link to DA-6's editorial-framing concern (consider gating to role).
- **FR13 / FR14** — Define the inspection-throughput constants explicitly: *"inspection-per-day cap (default 12, matches rigger cap)"* and *"inspections-per-chute (= 2, one initial + one final)"*. **Resolving DA-1** with operational confirmation (shared vs separate labor pool) is the deeper unblock.
- **FR18** — Resolve DA-2 first (columns vs transition log). Once the data architecture is locked, this FR can clearly specify *"median time-in-stage from Packed to Ready, computed over chutes with zero rejections in the window"* (column model) or *"...over all stage transitions in the window"* (log model).
- **FR22** — Bound "affected window" explicitly: *"all events whose draw_date falls between today and 24 months out."*
- **FR24** — Replace "concrete context" with a presentation contract: *"each metric is presented as a noun phrase including the unit and the time window (e.g., 'inspector-days short over next 30 days')."*
- **FR26 / FR27** — Resolve DA-3 first (polling cadence vs Journey 3's real-time UX). The chosen cadence then anchors both FRs.
- **FR28** — Stronger verification method (resolves DA-5): *"Verified by running the existing curl smoke set listed in the PR template against pre- and post-merge builds; expected response shapes are captured in `backend/smoke-curls.md` (to be created)."* Even a manual checklist beats single-sample curls.

### Overall Assessment

**Severity:** **Pass** (0% flagged FRs — far below the 10% Warning threshold)

**Recommendation:** **Functional Requirements demonstrate excellent SMART quality.** 72% of the 32 FRs are perfect 5/5 across all dimensions, and no FR scored below 3 in any category. The 9 sub-5 FRs all cluster around concerns the validation pass has already surfaced as DA findings — meaning the SMART evaluation does not introduce new issues; it confirms the same set of 3 high-priority concerns (DA-1, DA-2, DA-3) plus a handful of small wording tightenings.

**Edit-phase priority:** Resolve DA-1, DA-2, and DA-3 first — that lifts FR13, FR14, FR18, FR26, FR27 in one stroke. The remaining wording tightenings (FR5, FR6, FR8, FR22, FR24, FR28) are 5-minute fixes that can be batched.

---

## Holistic Quality Assessment

### Document Flow & Coherence

**Assessment:** **Good** — clear narrative arc, strong governance hygiene, modest verbosity.

**Strengths:**
- **Coherent thesis carried through the doc.** The "inspection as throughput, not compliance" framing appears in Executive Summary, What Makes This Special, Design Philosophy, Project Classification, and Domain-Specific Requirements — five touchpoints reinforcing the same idea. No drift.
- **Four user journeys are vivid and specific.** Not "user does X" sketches but full scenes with names, times, edge cases (Vasquez forgetting he packed AC-1987; Park going on emergency leave). The PRD reads as if the author has watched a packing floor.
- **Explicit Journey Requirements Summary table** (lines 284–298) makes the journey → FR traceability *visible*, not just claimed. This is rare in PRDs.
- **Three different out-of-scope statements at three altitudes:** "What this PRD does NOT cover" (Exec Summary), "What is explicitly NOT being silently re-scoped" (Product Scope), "What the handoff team should NOT assume" (Domain). Each catches a different class of scope-creep risk. Strong governance.
- **Tradeoffs are named, not hidden.** Polling vs websockets, columns vs log, operational vs audit — each tradeoff has a stated decision and reasoning.

**Areas for Improvement:**
- **Section-overlap verbosity.** Four candidates from density review: Project Classification ↔ frontmatter; What Makes This Special ↔ Design Philosophy; Project Scoping → MVP Philosophy ↔ Product Scope; Web App Spec Reqs → Performance/Accessibility ↔ NFR-P/NFR-A cross-references.
- **Line count: 511 lines / 7,498 words.** Heavy for a 2-epic increment doc. Achievable trim: ~30–50 lines without losing signal.
- **Two unresolved architecture decisions** (DA-1 labor pool, DA-2 time-in-stage architecture) sit in the doc as bullet items rather than being routed to a "decisions to resolve before code lands" register.

### Dual Audience Effectiveness

**For Humans:**
- **Executive-friendly:** ✅ Strong. Exec Summary names the value (planning visibility), the change (Epic A + Epic B), and the explicit boundaries in under a screen.
- **Developer clarity:** ✅ Strong. NFRs are testable; FRs are clean of leakage; PRD anchors to specific code locations (`LaborMatrix`, `Feasibility`, `docker-compose.yml`) where brownfield context demands it.
- **Designer clarity:** ⚠️ Moderate. User journeys are excellent design fodder. But no UX flow diagrams or wireframe references — those would land in the UX design doc next. WAP-1 (browser matrix placeholder) is UX-adjacent and still open.
- **Stakeholder decision-making:** ✅ Strong. Tradeoffs are explicit; the "What is explicitly NOT being silently re-scoped" sub-section is governance gold.

**For LLMs:**
- **Machine-readable structure:** ✅ Strong. Consistent `## Level 2` headers; complete frontmatter with classification; ID prefixes on every FR/NFR.
- **UX readiness:** ✅ Strong. Journeys give clear interaction blueprints; FRs are capabilities, not implementation.
- **Architecture readiness:** ✅ Strong. NFRs give performance/security/operability targets with thresholds; schema changes are named (`packed_at`, `initial_inspected_at`, `final_inspected_at`); the Inspector Capacity → `LaborMatrix`-parallel pattern is explicit.
- **Epic/Story readiness:** ✅ Strong. Two epics named explicitly with FR sets; the FR/journey/epic mapping table is essentially a story-extraction guide.

**Dual Audience Score:** **4.5/5** (deducted 0.5 for designer clarity gap that resolves through the next-phase UX doc, not through PRD changes).

### BMAD PRD Principles Compliance

| Principle | Status | Notes |
|---|---|---|
| Information Density | **Met** | 0 anti-pattern violations; 4 section-overlap candidates flagged for edit phase |
| Measurability | **Met** | 1 issue: NFR-S6 not measurable as an NFR; 5 FRs depend on undefined constants (resolves through DA-1, definition tightening) |
| Traceability | **Met** | 0 orphans; explicit Journey Requirements Summary table |
| Domain Awareness | **Met** | Domain rules captured with code-traced anchors; out-of-scope rules named (operational framing per memory:[[plims-product-framing]]) |
| Zero Anti-Patterns | **Met** | 0 subjective adjectives, 0 vague quantifiers in FRs/NFRs |
| Dual Audience | **Met** | Works for humans and LLMs (see above) |
| Markdown Format | **Met** | Consistent `##` structure, frontmatter present, IDs on requirements |

**Principles Met:** **7/7**

### Overall Quality Rating

**Rating:** **4/5 — Good** (strong with minor improvements needed)

**Why not 5/5?** Two substantive unresolved issues sit in the PRD's foundations:
- **DA-1** (inspector vs rigger labor pool) is potentially a math-correctness issue in the product's core value prop. A 5/5 PRD resolves this before declaring complete.
- **DA-2** (time-in-stage architecture vs Growth rework path) is architecturally incompatible with the announced roadmap. A 5/5 PRD picks the right architecture up front.

**Why not 3/5?** Because everything else is excellent: user journeys carry weight; traceability is visible and verified; out-of-scope hygiene is three-layered; 100% of FRs score ≥3 on SMART (72% perfect); brownfield discipline holds across 60 requirements; no anti-pattern violations; the operational-vs-audit framing is principled and confirmed by the project owner.

This is a strong PRD with two known-blocker concerns and ~10 polish items. With DA-1, DA-2, DA-3 resolved and the structural cleanups landed, this would be a 5/5.

### Top 3 Improvements

1. **Resolve DA-1: Inspector vs rigger labor pool ambiguity.**
   - **Why:** The Senior NCO interview must confirm whether inspection labor draws from the same pool as rigging (Journey 2 strongly suggests this — *"Vasquez pulled off packing to do inspections"*) or a separate pool. If shared, FR13/FR14 and the Inspector Capacity feasibility math need redesign before code lands. This is the highest-leverage single fix because it directly affects whether the product's core math is correct.
   - **How:** Open a new question (call it IW-9?) targeted at the Senior NCO interview. Default until answered: model labor as a single pool with role-of-day. Update FR13/FR14 to match.

2. **Resolve DA-2: Time-in-stage architecture (columns vs transition log).**
   - **Why:** The current per-stage timestamp columns are incompatible with the announced Growth rework path (rejection sends chute back to `unpacked` and overwrites timestamps). Picking the right architecture now costs a one-evening migration design decision; picking it later is a schema migration against a live DB.
   - **How:** Hold a 30-minute architecture call before code lands. If the rework path is real in Growth, adopt a `parachute_stage_transitions` log table now and derive the columns view from it. Update FR16/FR18 and the Technical Success bullet to match.

3. **Move NFR-S6 to a "Known Risks / Acknowledged Weaknesses" section and merge with DA-9.**
   - **Why:** NFR-S6 is the only formal Measurability violation (it has no metric / condition / measurement method — it's a narrative acknowledgment). Treating an admission of a security gap as an NFR confuses the rubric and dilutes the surrounding security NFRs. DA-9 attacks the same statement from the mitigation-credibility angle. Both findings point to one cleanup.
   - **How:** Add a new sub-section "Acknowledged Weaknesses" after the NFR section (or under Risk Mitigation Strategy). Move NFR-S6's content there, rewritten honestly: *"There is no mitigation for inspector-identity fraud in Increment 2. The risk is accepted as part of prototype-grade security posture and resolves only when GEN-2 (auth) lands."* This is the cleanest single structural improvement and takes 5 minutes.

### Summary

**This PRD is:** A strong product-thinking artifact carrying a clear thesis (inspection as planning-math, not compliance), four operationally-grounded user journeys, and 60 well-disciplined requirements — held back from excellence by two unresolved architectural decisions that the edit phase should address before code lands.

**To make it great:** Resolve DA-1 and DA-2 with the Senior NCO and an architecture call respectively, then move NFR-S6 to a Known Risks section. The remaining polish items batch in under an hour.

---

## Completeness Validation

### Template Completeness

**Template Variables Found:** **0**
- No `{variable}`, `{{variable}}`, or `[placeholder]` template syntax remaining.

**Acknowledged TBDs (not template leaks):** 3 — all named with open-question IDs and resolution paths
- Line 116: *"≤ N days (N TBD — IW-5)"* — median time-in-stage budget, routed to Senior NCO interview
- Line 182: *"resolve IW-1, IW-5, IW-7, WAP-1, NA-2"* — list of interview-target questions
- Line 359: *"Concrete browser list TBD with the Senior NCO during the user interview (open question WAP-1)"*

These are honest open-question markers with explicit resolution mechanisms, not abandoned template placeholders. Acceptable for an in-flight PRD with a scheduled domain-expert interview.

### Content Completeness by Section

| Section | Status | Notes |
|---|---|---|
| Executive Summary | **Complete** | Vision, two epics, primary user, explicit out-of-scope |
| Project Classification | **Complete** | All 7 table rows populated |
| Success Criteria | **Complete** | User / Operational / Technical bands + Measurable Outcomes table |
| Product Scope | **Complete** | MVP, Growth, Vision phases each named |
| Project Scoping & Phased Development | **Complete** | Philosophy, Resources, Risk Mitigation (3 risk tables), explicit "not silently re-scoping" |
| User Journeys | **Complete** | 4 named journeys + Journey Requirements Summary table |
| Domain-Specific Requirements | **Complete** | Encoded rules, not-encoded rules, technical constraints, integration, risks, "what not to assume" |
| Web Application Specific Requirements | **Complete** | App type, browser/device, SEO, real-time, perf cross-ref, accessibility cross-ref, responsive, non-goals, implementation considerations |
| Functional Requirements | **Complete** | 32 FRs in 8 logical clusters + Existing-System Preservation guard |
| Non-Functional Requirements | **Complete** | 28 NFRs across Performance (6), Security (6), Reliability (5), Accessibility (5), Operability (6) |

### Section-Specific Completeness

| Check | Status | Notes |
|---|---|---|
| Success Criteria measurable | **All** | Each criterion has a method (with the IW-5 N-value TBD honestly acknowledged) |
| User Journey coverage | **Yes** | Rigger (Doe), Initial Inspector (Vasquez), Senior/Final Inspector (Chen), Senior NCO (Riley) — all four named user roles covered |
| FRs cover MVP scope | **Yes** | Epic A (FR1–FR18, FR26–FR27), Epic B (FR19–FR25), Regression guards (FR28–FR32) |
| NFRs have specific criteria | **All except NFR-S6** | 27/28 testable; NFR-S6 already flagged (Measurability validation + Holistic Improvement #3) |

### Frontmatter Completeness

| Field | Status |
|---|---|
| `stepsCompleted` | **Present** (12-step list) |
| `classification` (projectType, domain, complexity, projectContext, audience, scopeFocus) | **Present** (all 6 sub-fields) |
| `inputDocuments` | **Present** (4 documents listed) |
| `date` / `completedDate` | **Present** (2026-05-16) |

**Frontmatter Completeness:** **4/4** ✓

### Completeness Summary

**Overall Completeness:** **100%** (10/10 sections complete; 0 template variables; 3 honest open-question markers; 4/4 frontmatter fields populated)

**Critical Gaps:** **0**
**Minor Gaps:** **0** (the 3 TBDs are acknowledged with resolution paths, not gaps)

**Severity:** **Pass**

**Recommendation:** PRD is **structurally complete**. All required sections present with required content. Template/syntax is clean. Frontmatter is fully populated. The remaining open questions are explicitly named and routed to a scheduled Senior NCO interview — appropriate handling for an in-flight PRD.

---

## Post-Validation Addendum: `docs/open-questions.md` Discovery

**Discovered after step-v-13:** The PRD references `docs/open-questions.md` repeatedly (IW-1, IW-5, IW-6, IW-7, WAP-1, NA-1, NA-2, GEN-1, GEN-2) but the validation pass did not read it during steps v-01 through v-12. Reading it now produces material adjustments to two findings:

### DA-2 (time-in-stage architecture) — Severity downgraded from HIGH to LOW

`docs/open-questions.md` IW-6 documents the columns-vs-log decision consciously:

> *"Chosen direction: (a) Per-stage timestamp columns. Revisit when the rework path (Growth feature) is scoped — if rework history matters, (b) becomes attractive. Status: Decision parked at (a) for MVP; revisit at Growth scoping."*

The architectural decision is not an oversight — it is a documented MVP decision with an explicit revisit trigger tied to the Growth rework path. DA-2's substantive concern is correct but the *severity* is wrong: this is not an unresolved blocker, it's a known parked decision.

**Adjusted recommendation:** Add a single line in the PRD's Technical Success bullet that points readers to `docs/open-questions.md#IW-6` so the parking is visible from the PRD without restating it. Five-minute fix.

### DA-1 (inspector vs rigger labor pool) — Still HIGH, but more specific

`docs/open-questions.md` IW-7 asks about *inspector pack-limit values* (analogous to the 12/day rigger cap) but does NOT ask about whether inspectors and riggers draw from the same labor pool. So DA-1's core concern survives unchanged: the labor-pool overlap question is genuinely new and unanswered.

**Adjusted recommendation:** Add a new open question entry — call it **IW-9** — explicitly framed as: *"Is inspection labor a separate pool from rigger labor, or are inspectors riggers wearing a different hat on a given day?"* Route to the same Senior NCO interview. This is the cleanest way to surface DA-1 within the existing open-question discipline.

### Other findings — Unchanged

DA-3 (polling cadence), DA-4 (NFR-R1 backfill), DA-5 (unverifiable metrics), DA-6 (workload editorial), DA-7 (15s provenance), DA-8 (no timeline), DA-9 (auth fraud) are not addressed by any existing open-question entry. They remain as the validation report originally framed them.

### Validation Process Note

The discovery that `docs/open-questions.md` exists and is load-bearing for the PRD is itself a finding about validation hygiene: future PRD validations should explicitly load any file the PRD references in its body, not only the files listed in `inputDocuments` frontmatter. The PRD references this file at lines 48, 96, 105, 116 and elsewhere, but it isn't in the frontmatter — so the formal step-v-01 input-loading missed it.

**Recommendation for future validation passes:** Add to the validation discipline — *"grep the PRD body for `docs/` and `.md` references; load any that the frontmatter didn't already capture."*

