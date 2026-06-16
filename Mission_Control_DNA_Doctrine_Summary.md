# Mission Control DNA — Doctrine Summary

This document is the short entrypoint to the Mission Control DNA doctrine.

The full doctrine is split into:

- `Mission_Control_DNA.md` — core constitution;
- `Mission_Control_DNA_Turbovec_Appendix.md` — performance, packed indexes, projection and replay;
- `Mission_Control_DNA_WhatIf_Appendix.md` — hypothesis branches and What-If Analysis.

The summary below is intentionally short. It defines the non-negotiable architecture laws that every Mission Control PR must preserve.

---

## 1. Core law

```text
Semantic owns meaning.
Admission Guard owns admission.
Mission Control owns observation.
Turbovec accelerates access.
Renderer displays projection.
Hypothesis owns no authority.
```

Mission Control may observe, replay, project, inspect and simulate.

Mission Control must never redefine Semantic state or create admission truth.

---

## 2. Authority boundary

The central authority rule is:

```text
Admission Guard decides.
Mission Control observes.
Semantic protocol connects them.
```

Admission Guard owns:

- admission decisions;
- verdict logic;
- policy checks;
- invariant admission;
- `admitted` / `rejected` / `needs_review` outcomes.

Mission Control owns:

- event intake;
- canonical graph observation;
- replay;
- visual projection;
- inspector;
- timeline;
- What-If simulation.

Mission Control may display a verdict.

Mission Control must not create a verdict.

---

## 3. Canonical graph law

Mission Control does not render raw files, AST fragments or decorative nodes.

It builds a canonical project state graph from semantic events.

```text
semantic event stream
  -> canonical graph model
  -> visual projection rules
  -> renderer
```

The graph represents project state, not UI decoration.

The renderer does not own meaning.

---

## 4. Event-sourced construction

Mission Control graph state is built through event application:

```text
old graph state
  + semantic event
  = new graph state
```

The event log is the replay source.

Snapshots are recovery and acceleration points.

The same event stream must reconstruct the same canonical graph state.

---

## 5. Renderer is projection only

Visual state is downstream from semantic state.

Allowed visual outputs:

- color;
- size;
- layer;
- opacity;
- particles;
- animation;
- camera focus;
- layout hints.

Forbidden:

- deriving admission verdict from color;
- deriving conflict truth from animation;
- storing semantic truth in Three.js objects;
- making renderer history into replay history.

The renderer is a display surface, not a source of truth.

---

## 6. Semantic compatibility law

Mission Control DNA is valid only while it preserves Semantic principles.

If Mission Control DNA conflicts with Semantic core doctrine, Mission Control DNA must be corrected.

Semantic doctrine wins.

Mission Control must preserve:

- Verifier-First alignment;
- explicit effects;
- deterministic replay;
- Quad Logic;
- S-state as conflict, not warning;
- path toward Semantic-native v2.

---

## 7. Quad Logic law

Semantic state must not be collapsed into ordinary boolean UI status.

```text
T = true / verified
F = false / rejected condition
N = unknown / insufficient information
S = conflict / contradiction / paradox
```

Mandatory rule:

```text
S != Warning
```

S-state changes routing and proof transit.

It is not a yellow badge.

---

## 8. Turbovec projection law

Mission Control should not constantly materialize and render the full graph.

It should maintain a compact indexed semantic field and render only the active projection.

Core formula:

```text
P_t = Π_q(Φ(ρ(G_{t-1}, e_t)))
```

Where:

- `ρ` applies an event to canonical graph state;
- `Φ` packs / updates the Turbovec-style index;
- `Π_q` extracts the visible projection for query or mode;
- `P_t` is the visible graph slice.

Turbovec is acceleration.

Turbovec is not authority.

---

## 9. Delta indexing law

Runtime should update the Turbovec index incrementally.

```text
I_t = δΦ(I_{t-1}, e_t)
```

Correctness invariant:

```text
δΦ(I_{t-1}, e_t) ≡ Φ(ρ(G_{t-1}, e_t))
```

Delta patching is for speed.

Full rebuild is the oracle.

---

## 10. Identity law

Semantic IDs are canonical.

Dense indices are internal.

```text
SemanticId -> stable identity
DenseIndex -> fast internal address
NodeHandle = { index, generation }
```

Deletion should use tombstones before compaction.

Recommended rule:

```text
compaction = snapshot boundary
```

---

## 11. Time-travel law

Canonical time-travel uses snapshot plus forward replay.

```text
TimeTravel(τ) = ReplayForward(Snapshot_max(c_i <= τ), Events_{c_i+1:τ})
```

Reverse patches are allowed only as short local UI optimization.

Reverse patches are not replay authority.

---

## 12. What-If law

What-If Analysis is allowed.

It must never mutate canonical history.

```text
What-If does not rewrite history.
What-If creates an isolated hypothesis branch.
```

What-If rendering:

```text
WhatIf(τ, H) = Render(Π_q(I_τ ⊕ ΔI^hyp(H)))
```

Mandatory rule:

```text
Authority(WhatIf) = 0
```

A hypothesis can show an alternative reality.

It cannot make that reality true.

---

## 13. Promotion law

A hypothesis branch cannot become canonical through Mission Control.

Correct path:

```text
Hypothesis branch
  -> candidate patch / candidate event plan
  -> Semantic / Admission Guard validation
  -> real canonical events
  -> canonical Mission Control projection
```

Only Admission Guard may promote a candidate into canonical admission events.

---

## 14. Event Log Poisoning prevention

Hypothetical events must use a separate namespace:

```text
hypo.*
```

Mandatory rules:

```text
hypo.* events must never be accepted as canonical events
hypo.verdict must never equal verdict.emitted
```

Simulation must not contaminate source-of-truth history.

---

## 15. Modular doctrine structure

The DNA should remain modular.

The main file is the constitution.

Appendices are engineering standards.

This keeps the entrypoint readable while preserving the mathematical and implementation detail needed for deeper work.

Recommended reading order:

```text
1. Mission_Control_DNA_Doctrine_Summary.md
2. Mission_Control_DNA.md
3. Mission_Control_DNA_Turbovec_Appendix.md
4. Mission_Control_DNA_WhatIf_Appendix.md
```

---

## 16. Final doctrine statement

Mission Control is a semantic observability and simulation system.

It makes Semantic project causality visible.

It can replay the past, observe the present and simulate alternative futures.

But it cannot decide truth.

Final law:

```text
Semantic rules.
Admission Guard judges.
Mission Control reveals.
```
