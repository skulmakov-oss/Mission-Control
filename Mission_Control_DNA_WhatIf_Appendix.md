# Mission Control DNA — What-If Branching Appendix

This appendix extends the Mission Control DNA with the rules for time-travel branching, hypothesis overlays and What-If Analysis.

It must be read together with:

- `Mission_Control_DNA.md`
- `Mission_Control_DNA_Turbovec_Appendix.md`

The goal is to allow Mission Control to simulate alternative semantic futures without mutating canonical history or weakening Admission Guard authority.

---

## 1. Core decision

Mission Control should support What-If Analysis.

However, What-If must never mutate the canonical event log.

Core rule:

```text
What-If does not rewrite history.
What-If creates an isolated hypothesis branch.
```

Mission Control may show a hypothetical branch.

Only Semantic / Admission Guard may promote that branch into canonical reality.

---

## 2. Timeline model

Mission Control has two timeline classes.

```text
Canonical timeline
  = official event history

Hypothesis branch
  = temporary alternative analysis branch
```

Canonical timeline owns:

- official events;
- accepted snapshots;
- canonical graph state;
- canonical Turbovec index;
- real Admission Guard verdicts.

Hypothesis branch owns:

- hypothetical events;
- overlay graph deltas;
- overlay index deltas;
- provisional projections;
- non-authoritative outcomes.

---

## 3. Formal branching model

Given canonical event log:

```text
E = (e_1, e_2, ..., e_t)
```

A user may time-travel to a target point `τ`:

```text
τ < t
```

Mission Control restores the canonical state at `τ`:

```text
(G_τ, I_τ) = ReplayForward(Snapshot_c*, Events_{c*+1:τ})
```

Then a hypothesis branch applies hypothetical events:

```text
H = (e'_1, e'_2, ..., e'_n)
```

The hypothetical state is:

```text
(G^hyp_{τ+n}, I^hyp_{τ+n}) = Fold((G_τ, I_τ), H)
```

The visible hypothetical projection is:

```text
P^hyp_{τ+n} = Π_q(I^hyp_{τ+n})
```

---

## 4. Canonical isolation law

Hypothetical events must not be appended to the canonical event log.

```text
E_canonical != E_canonical + H
```

Unless Semantic / Admission Guard explicitly validates and emits real canonical events.

Therefore:

```text
hypothesis events live separately
hypothesis events do not mutate canonical graph
hypothesis events do not mutate canonical index
hypothesis events do not create real verdicts
```

---

## 5. Hypothesis event namespace

Hypothetical events must use a distinct namespace.

Examples:

```text
hypo.node.updated
hypo.edge.added
hypo.edge.removed
hypo.conflict.resolved
hypo.invariant.relaxed
hypo.invariant.strengthened
hypo.effect.guarded
hypo.contract.strengthened
hypo.verdict.requested
hypo.branch.created
hypo.branch.discarded
```

Important law:

```text
hypo.verdict != verdict.emitted
```

A hypothetical verdict is not an Admission Guard verdict.

---

## 6. Authority model

What-If has no admission authority.

```text
Authority(HypothesisBranch) = 0
Authority(HypothesisProjection) = 0
Authority(WhatIf) = 0
Authority(MissionControl) = Observation
Authority(AdmissionGuard) = Admission
Authority(Semantic) = Meaning
```

Mission Control may say:

```text
hypothetical outcome: conflict reduced
hypothetical outcome: proof path restored
hypothetical outcome: likely candidate for admission
```

Mission Control must not say:

```text
admitted
rejected
verified
```

unless those states come from Semantic / Admission Guard canonical events.

---

## 7. Overlay model

Hypothesis branches should be implemented as overlays, not full graph copies.

Preferred model:

```text
base snapshot / base index
  + hypothesis overlay delta
  + hypothesis bitsets
  + hypothesis projection
```

Mathematically:

```text
I^hyp = I_τ ⊕ ΔI^hyp(H)
```

Where `⊕` is an overlay operation.

The base index remains unchanged.

The overlay is discardable.

---

## 8. Copy-on-write rule

Hypothesis branches should use copy-on-write semantics.

Rules:

1. Do not copy the full canonical graph for a small hypothesis.
2. Store only changed nodes, edges, masks and metadata in the hypothesis overlay.
3. Read unchanged values from the base snapshot/index.
4. Write changed values into the overlay.
5. Discarding a branch must have no side effects.

This keeps What-If cheap enough for interactive exploration.

---

## 9. What-If rendering formula

The rendering path for a hypothesis branch is:

```text
WhatIf(τ, H) = Render(Π_q(I_τ ⊕ ΔI^hyp(H)))
```

With mandatory limitation:

```text
Authority(WhatIf) = 0
```

The renderer displays the projected alternative branch.

It does not make that branch canonical.

---

## 10. Visual distinction rule

Hypothesis projection must be visually distinct from canonical projection.

Required labels:

```text
HYPOTHESIS
SIMULATION
NOT ADMITTED
NOT VERIFIED
```

Possible visual language:

| Item | Visual behavior |
|---|---|
| canonical graph | normal projection |
| hypothesis graph | ghost layer / translucent overlay |
| hypothesis node | dashed outline / translucent fill |
| hypothesis edge | dashed relation / lower opacity |
| hypothesis conflict resolution | provisional marker, not verified green |
| AG-confirmed result | normal canonical projection only after real event |

The user must never confuse a hypothesis with an admitted state.

---

## 11. Three levels of What-If

### 11.1 Visual hypothesis

Fast, local, non-authoritative simulation.

Examples:

```text
what if this conflict were marked resolved?
what if this edge were removed?
what if this proof path were hidden?
```

This is useful for exploration but has no semantic authority.

### 11.2 Semantic hypothesis

A structured candidate expressed in Semantic-level terms.

Examples:

```text
candidate invariant update
candidate guard addition
candidate effect boundary
candidate contract strengthening
```

This must be checked by Semantic / Admission Guard before becoming real.

### 11.3 Admitted branch

A hypothesis becomes admitted only after Admission Guard checks it and emits canonical events.

```text
hypothesis branch
  -> candidate patch / candidate event plan
  -> Semantic / Admission Guard check
  -> real verdict.emitted
  -> canonical graph update
```

Only this level can become part of official history.

---

## 12. Promotion path

Mission Control must not directly promote a hypothesis into canonical state.

Correct path:

```text
Hypothesis branch
  -> export candidate patch / candidate event plan
  -> Semantic / Admission Guard validates
  -> Admission Guard emits real canonical events
  -> Mission Control consumes real events
  -> canonical graph updates
```

Incorrect path:

```text
Hypothesis branch
  -> Mission Control directly mutates canonical graph
```

Promotion law:

```text
Promote(WhatIf) = AdmissionGuard(H)
```

---

## 13. Relationship to time-travel

Time-travel may fork.

Canonical replay remains unchanged.

Correct flow:

```text
TimeTravel(τ)
  -> restore canonical state at τ
  -> fork hypothesis branch
  -> apply hypo.* events in overlay
  -> render hypothesis projection
```

The canonical timeline remains:

```text
Snapshot + Forward Replay
```

Hypothesis branch is not replay authority.

---

## 14. Relationship to Turbovec

What-If should reuse the Turbovec index through overlays.

Possible structures:

```text
HypothesisOverlay
├─ changed_node_status
├─ changed_node_flags
├─ changed_edge_status
├─ added_edges
├─ removed_edges
├─ hypothesis_conflict_bitset
├─ hypothesis_unknown_bitset
├─ hypothesis_routing_masks
└─ branch_metadata
```

Projection should read:

```text
base index first
then overlay delta
then query mode
then visible projection
```

This avoids full graph duplication.

---

## 15. Hypothesis branch lifecycle

A branch may move through these states:

```text
created
active
paused
compared
discarded
exported
submitted_to_admission_guard
admitted
rejected
```

Only `admitted` after real Admission Guard validation may produce canonical events.

`rejected` here means the hypothesis was rejected by real validation, not merely hidden by UI.

---

## 16. Branch comparison

Mission Control may compare canonical and hypothesis projections.

Useful comparison outputs:

- added nodes;
- removed nodes;
- changed statuses;
- changed routing masks;
- changed conflict paths;
- changed verdict path candidate;
- affected invariants;
- affected effects;
- changed proof connectivity.

Comparison must remain descriptive.

It must not create admission truth.

---

## 17. Branch discard rule

Hypothesis branches must be discardable without side effects.

Discarding a branch must:

```text
remove overlay deltas
remove hypothesis bitsets
remove branch-local projections
remove UI branch state
preserve canonical event log
preserve canonical snapshot
preserve canonical Turbovec index
```

Discarding a branch must not emit canonical node/edge updates.

---

## 18. Branch persistence

Mission Control may save hypothesis branches as artifacts.

Saved hypothesis artifacts must be clearly marked:

```text
artifact.kind = hypothesis
authority = none
source_timeline = canonical run id
fork_event = τ
not_admitted = true
```

Saved hypothesis artifacts are review material, not canonical state.

---

## 19. PR and Codex guardrails

Any PR adding What-If behavior must answer:

```text
[ ] Does it keep canonical event log immutable?
[ ] Does it use hypo.* namespace for hypothetical events?
[ ] Does it keep hypothesis graph as overlay, not canonical state?
[ ] Does it visually distinguish hypothesis from canonical graph?
[ ] Does it prevent hypo verdict from becoming real verdict?
[ ] Does it require Admission Guard for promotion?
[ ] Does it keep branch discard side-effect free?
[ ] Does it avoid renderer history as hypothesis history?
[ ] Does it preserve Semantic IDs as canonical identity?
[ ] Does it keep dense indices internal to base/overlay index layers?
```

Codex tasks must include:

```text
What-If branches are simulations.
They must not mutate canonical event log.
They must not emit real verdicts.
They must be overlays and must be discardable.
Only Admission Guard may promote a candidate into canonical events.
```

---

## 20. Final law

What-If Analysis is allowed because it strengthens understanding.

It is safe only because it has no authority.

Final law:

```text
What-If can show an alternative reality.
It cannot make that reality true.
```

Mission Control may become a simulator of semantic consequences.

It must never become the authority that admits those consequences.
