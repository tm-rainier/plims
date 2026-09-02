---
project: plims
owner: Jake
purpose: 'Track open questions, decisions parked for later, and user-interview prep across all PLIMS planning work (PRD, architecture, stories).'
last_updated: '2026-05-19'
---

> **Framing update (2026-05-16):** PRD Increment 2 is framed as **manning / planning / operations**, NOT audit or compliance. Inspection labor is a constrained resource the planner must reason about. Audit artifacts are byproducts. All questions below should be interpreted with that lens.

# PLIMS Open Questions Log

A living document. When a question is answered, move the entry to the **Resolved** section at the bottom with the answer and the date. When a new question surfaces in any planning conversation, add it here rather than letting it leak into a draft as a guess.

## Status legend

- 🔴 **Blocking** — a downstream deliverable can't be finalized without this answer
- 🟡 **Needed soon** — answer expected before implementation of the relevant feature begins
- 🟢 **Nice to have** — can be answered later; reasonable default exists

---

## Inspection Workflow

### IW-1 🔴 What is the *current* (pre-PLIMS) inspection process?

**Source:** PRD vision discovery, 2026-05-16
**Asked by:** Jake → needs user interview
**Why it matters:** Determines what PLIMS is replacing (paper log? spreadsheet? verbal handoff? nothing formal?) and therefore what migration / transition / training the handoff team has to plan for.

**Interview prompts to take into the conversation:**

1. Walk me through, step-by-step, what happens today from "rigger finishes packing a chute" to "chute is officially Ready for Issue."
2. Where is the inspection signoff recorded right now? (paper, spreadsheet, verbal, system, nothing)
3. Who physically does the initial inspection? The final inspection? Are they always two different people?
4. How long, on average, does a chute sit between Packed and Ready today? Where does it physically wait?
5. Has there ever been a missed or late inspection that caused a mission impact? What happened?
6. If a chute fails inspection, what happens to it? (sent back to rigger? quarantined? scrapped?) Where is the failure recorded?
7. How do you handle disagreements between the initial and final inspector?
8. At audit time (quarterly? annually?) what does a unit's inspector currently produce to prove compliance?
9. Do inspectors work shifts? Are they ever the same person who packed the chute (allowed or forbidden)?
10. What would you, as the inspector, want PLIMS to make 10× faster than today?

**Status:** Open — pending user interview

---

### IW-2 🟢 Should an inspector be allowed to inspect a chute they themselves packed?

**Source:** Implicit from IW-1 question 9
**Why it matters:** Determines whether PLIMS must enforce `packer_id != initial_inspector_id != final_inspector_id`.
**Likely answer (default):** Yes-enforced — separation-of-duties is standard in safety-critical inspection chains. Confirm with Senior NCO.
**Status:** Open

---

### IW-5 🟡 Time-in-stage budget — what's the operational SLA for Packed → Ready?

**Source:** PRD Step 3 (Success Criteria), 2026-05-16
**Asked by:** Jake → needs Senior NCO input during user interview
**Why it matters:** This is the *N* in "median chute moves Packed → Ready within N days." It calibrates the inspection-bottleneck warning threshold. Without N, the planning health panel doesn't know what counts as a backlog.
**Interview prompts:**

1. How long *should* a chute sit between being packed and being available for issue?
2. At what point does an unfinished inspection start to concern you operationally?
3. Is the answer different for surge mode vs. normal ops?
4. Different for reserve vs. main?

**Status:** Open

---

### IW-6 🟡 Time-in-stage tracking — per-stage timestamps vs. transition log?

**Source:** PRD Step 3 technical decision, 2026-05-16
**Why it matters:** Increment 2 needs to track when a chute entered each stage. Two architectural options:

- **(a) Per-stage timestamp columns on `parachutes`** — `packed_at`, `initial_inspected_at`, `final_inspected_at`. Simple, fast queries. Loses history if a chute goes back to `unpacked` (rework). **Chosen for Increment 2 MVP.**
- **(b) Append-only `parachute_stage_history` table** — every transition logged as a row. Preserves full history including rework loops. More joins, more code. Better for audit framing, which we deprioritized.

**Chosen direction:** (a). Revisit when the rework path (Growth feature) is scoped — if rework history matters, (b) becomes attractive.
**Status:** Decision parked at (a) for MVP; revisit at Growth scoping.

---

### IW-7 🟡 Inspector capacity rule — what's the daily inspection cap per inspector?

**Source:** PRD Step 3 technical success, 2026-05-16
**Asked by:** Jake → needs Senior NCO input
**Why it matters:** The new "Inspector capacity in feasibility math" requirement needs a pack-limit equivalent. Is it the same 12/day cap as riggers? Different? Two-person rule means each chute consumes inspector time TWICE — does that double the load or is each inspection step its own fast operation?
**Interview prompts:**

1. Realistically, how many chutes can one inspector process per day at each stage?
2. Is initial inspection the same time-cost as final inspection?
3. Is there a separate "surge mode" inspection cap, parallel to the 15/day rigger surge?

**Status:** Open

---

### IW-3 🟢 Failure / rework path — what status does a failed inspection produce?

**Source:** PRD discovery
**Why it matters:** Current `parachutes.status` enum is `ready | expired | maintenance | in_process`. No `failed_inspection` value exists. A migration may be needed, OR failed chutes can route back to `process_stage: unpacked` for repack.
**Status:** Open — answer depends on IW-1 #6

---

### IW-8 🔴 Is inspection labor a separate pool from rigger labor, or are inspectors riggers wearing a different hat on a given day?

**Source:** PRD validation, 2026-05-19 (DA-1 finding)
**Asked by:** John (validation pass) → needs Senior NCO confirmation
**Why it matters:** The PRD's FR13/FR14 model inspector capacity as a constraint **parallel** to rigger capacity, with both summing into feasibility math. But Journey 2 says *"CPL Vasquez has been pulled off packing to do inspections for the day"* — strongly implying inspectors are riggers wearing a different hat on a given day, not a separate labor pool. The ERD shows `users.role` as a single enum value per user, which suggests separate pools — but the on-floor reality may differ. If labor is shared, inspector-hours and rigger-hours come out of the same time budget; computing them as parallel constraints double-counts available labor and produces optimistic feasibility flags. This is potentially a math-correctness issue in the product's core value prop.

**Interview prompts:**

1. On a typical day, do specific people pack and other specific people inspect, or do riggers rotate between packing and inspecting?
2. If a rigger spends a day inspecting, are they available to pack that same day, or no?
3. Is the rotation planned (rosters), opportunistic (whoever's free), or doctrine-driven (always two designated inspectors)?
4. From a planning perspective, when you think about "do I have enough hands for next month's op," is rigger-labor and inspector-labor one number in your head or two?

**Working assumption (until answered):** Inspection labor is a **separate pool** (matches the ERD and current FR13/FR14 model). If the answer comes back "shared pool," Inspector Capacity in `Feasibility` needs redesign — likely a single labor pool with role-of-day assignments instead of two parallel constraints.

**Status:** Open — pending Senior NCO interview

---

## Notifications & Alerts

### NA-1 🟡 Does the Senior NCO need to be alerted while NOT in the app?

**Source:** PRD vision discovery, 2026-05-16
**Why it matters:** If yes → we need an out-of-band channel (email at minimum). If no → in-app risk surfacing is sufficient and notification scope shrinks significantly.
**Working assumption (until answered):** **No** — in-app surfacing only. The Senior NCO is the primary planner and is in PLIMS during planning sessions. Out-of-band alerting is out of scope for this PRD increment.
**Status:** Open — Jake to confirm

---

### NA-2 🟢 What's the "unforgivable miss" — the one alert that, if missed, breaks trust?

**Source:** PRD discovery
**Why it matters:** Helps prioritize which risk-surfacing signals must be tier-1 (always visible, hard to dismiss) vs. tier-2 (in a panel he has to look at).
**Candidates to validate with Senior NCO:**
- 30-day expiration wave (large batch about to expire all at once)
- Event becoming infeasible due to availability change (someone goes on leave, event flips red)
- Manning gap on a draw-date that already has a scheduled event
**Status:** Open

---

## Web App / Platform

### WAP-1 🟢 Browser and hardware target for the unit

**Source:** PRD Step 7 (web-app deep dive), 2026-05-16
**Asked by:** Jake → needs Senior NCO confirmation
**Why it matters:** PRD assumes recent Chromium (Chrome/Edge) on the unit's existing tablets + workstations, with tablet form factor (≥ 768px) prioritized. If actual unit hardware is different (older Android tablets, ruggedized Windows tablets, etc.), the Inspector journeys may need adjustment (input mechanism, screen real estate, network speed).
**Interview prompts:**

1. What devices will riggers/inspectors actually use PLIMS on? Specific make/model if possible.
2. What browser is installed? Latest version or pinned?
3. Is the floor environment online during work? Wi-Fi reliable?
4. Any GFE constraints — e.g., approved-browser list, no add-ons, kiosk mode?

**Working assumption (until answered):** recent Chromium on tablets ≥ 768px portrait and workstations. No mobile phone target. No offline mode.
**Status:** Open

---

## General / Other

### GEN-1 🟢 Production logging — is empirical pack-count tracking in scope soon?

**Source:** project-context.md note that `daily_logs.pack_count` is never written today
**Why it matters:** Affects whether feasibility math should switch from "labor *capacity*" to "remaining capacity given today's actuals." Not in this PRD increment but worth flagging.
**Status:** Parked — not in current scope

---

### GEN-2 🟢 Authentication / role-based access

**Source:** project-context.md
**Why it matters:** Currently no auth. Once Inspection Workflow ships with named inspectors, an unauthenticated user can claim to BE any inspector. Inspector identity is meaningless without auth.
**Working assumption (until answered):** Inspector identity captured via a "who are you?" dropdown for now. Real auth is a separate, larger epic. Flagged as risk in PRD non-functional section.
**Status:** Parked — explicit risk to call out in PRD

---

## Resolved

_(Move entries here once answered. Format: question → answer → date.)_

### IW-4 ✅ Two-person inspection chain — enforced or optional?

**Answered:** 2026-05-16 by Jake
**Decision:** **Enforced (option a).** Every chute must show two named inspectors — `initial_inspector_id` AND `final_inspector_id` — and PLIMS will enforce the pairing. This is audit-grade chain-of-custody, not workflow-track.
**Implications:**
- Schema: `parachutes` table needs `initial_inspector_id` and `final_inspector_id` columns (currently only `packer_id` exists). Migration required.
- API: state transition from `process_stage: packed → initial_inspected` requires `initial_inspector_id`. Transition `initial_inspected → final_inspected` requires `final_inspector_id`.
- UI: inspection signoff screens MUST capture who did the inspection.
