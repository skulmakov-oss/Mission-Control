# Mission Control DNA — Turbovec Appendix

This appendix extends `Mission_Control_DNA.md` with the Turbovec-oriented decisions reached during architecture review.

It is part of the Mission Control doctrine and must be considered together with the main DNA guide.

---

## 1. Purpose

Mission Control must be able to observe large Semantic projects without constantly materializing and rendering the full project graph.

The Turbovec principle is:

```text
Do not rebuild and render the whole graph on every change.
Maintain a compact indexed semantic field.
Materialize only the active projection needed by the user, run mode or event focus.
```

This preserves both performance and semantic strictness.

---

## 2. Core pipeline

The extended Mission Control pipeline is:

```text
Semantic / Admission Guard event
        ↓
canonical graph reducer
        ↓
Turbovec index update
        ↓
projection query
        ↓
visible graph slice
        ↓
3D renderer / inspector / timeline
```

Mathematically:

```text
E_t -> G_t -> I_t -> Q_t -> P_t -> R_t
```

Where:

| Symbol | Meaning |
|---|---|
| `E_t` | semantic event stream |
| `G_t` | canonical project graph |
| `I_t` | Turbovec-style compact graph index |
| `Q_t` | query / focus / activation mode |
| `P_t` | visible graph projection |
| `R_t` | renderer output |

Mission Control must not skip the canonical graph boundary.

---

## 3. Projection formula

The main formula:

```text
P_t = Π_q(Φ(ρ(G_{t-1}, e_t)))
```

Where:

| Operator | Meaning |
|---|---|
| `ρ` | applies event to canonical graph |
| `Φ` | packs or updates Turbovec index |
| `Π_q` | extracts projection for query / mode `q` |
| `P_t` | visible graph slice |

Runtime rendering is therefore:

```text
MissionControl_t = Render(Π_q(Φ(ρ(G_{t-1}, e_t))))
```

But authority remains zero for projection and rendering:

```text
Authority(Render) = 0
Authority(Φ) = 0
Authority(MissionControl) = Observation
Authority(AdmissionGuard) = Admission
Authority(Semantic) = Meaning
```

---

## 4. Turbovec index is acceleration, not authority

The Turbovec index exists to accelerate graph access.

It may accelerate:

- impact analysis;
- activation spreading;
- conflict scan;
- focused subgraph extraction;
- projection slicing;
- incremental updates;
- mode-specific graph queries.

It must not define semantic truth.

Correct:

```text
Semantic / Admission Guard emits S-state
Turbovec finds affected paths quickly
Mission Control visualizes conflict projection
```

Incorrect:

```text
Turbovec index decides that a node is semantically conflicted
```

Turbovec can route, filter, accelerate and slice.

It cannot decide meaning, admission or truth.

---

## 5. Compact representation

The canonical graph may be represented logically as:

```text
G_t = (V_t, E_t, κ, σ, μ)
```

Where:

| Symbol | Meaning |
|---|---|
| `V_t` | nodes |
| `E_t` | edges |
| `κ(v)` | node kind |
| `σ(v)` | node status |
| `μ(v)` | metadata |

The Turbovec index packs this graph into dense structures:

```text
TurbovecIndex
├─ node_id_table: SemanticId -> DenseIndex
├─ node_generation: u32[]
├─ node_kind: u16[]
├─ node_status: u8[]
├─ node_severity: u8[]
├─ node_flags: bitsets
├─ edge_source: u32[]
├─ edge_target: u32[]
├─ edge_type: u16[]
├─ edge_status: u8[]
├─ edge_weight: f32[]
├─ out_edges: adjacency ranges
├─ in_edges: adjacency ranges
├─ type_index: EdgeType -> EdgeId[]
├─ conflict_bitset
├─ unknown_bitset
├─ dirty_bitset
├─ affected_bitset
└─ tombstones
```

The implementation may evolve, but the principle must remain:

```text
canonical meaning first,
compact index second,
visual projection third.
```

---

## 6. Dense indices and Semantic IDs

Mission Control must maintain two levels of identity.

### 6.1 Semantic ID

Semantic ID is canonical and stable.

Examples:

```text
module:src/booking.semantic
fn:src/booking.semantic:create_slot
inv:src/booking.semantic:no_overlap
conflict:run-001:possible_overlap
verdict:run-001
```

Semantic IDs live in:

- event log;
- snapshots;
- source navigation;
- inspector;
- protocol boundary;
- replay artifacts.

### 6.2 Dense index

Dense index is internal and fast.

Example:

```text
fn:src/booking.semantic:create_slot -> 42
```

Dense indices live inside Turbovec.

They are not canonical project identity.

If compaction changes dense indices, Semantic IDs remain authoritative.

---

## 7. Handles, generations and tombstones

Mission Control may use an ECS-style handle model:

```text
NodeHandle = { index, generation }
```

Rules:

1. Deleting a node must not immediately shift all packed arrays.
2. Deletion should mark a tombstone and clear the active bit.
3. Generation protects against stale handles.
4. Compaction may reclaim tombstoned slots later.
5. Dense indices must not be exposed as stable public identity.

Deletion should be cheap:

```text
node.removed
  -> mark tombstone
  -> clear active bit
  -> preserve generation history
```

Compaction should be deliberate, not hidden.

Recommended rule:

```text
compaction = snapshot boundary
```

After compaction, create a new snapshot or require an existing stable snapshot boundary.

---

## 8. Delta indexing clause

Runtime should not rebuild the full Turbovec index after every event.

The main runtime update rule is:

```text
I_t = δΦ(I_{t-1}, e_t)
```

Where `δΦ` is a delta patch over the Turbovec index.

The correctness invariant is:

```text
δΦ(I_{t-1}, e_t) ≡ Φ(ρ(G_{t-1}, e_t))
```

Meaning:

```text
incremental index update must produce the same logical result
as rebuilding the index from the updated canonical graph.
```

This is mandatory.

Delta indexing is for speed.

Equivalence to canonical rebuild is for correctness.

---

## 9. Delta patch examples

### 9.1 node.added

```text
node_id_table[id] = new_dense_index
node_kind[index] = kind
node_status[index] = status
node_severity[index] = severity
active_bitset[index] = 1
```

### 9.2 node.updated

```text
index = node_id_table[node_id]
node_status[index] = new_status
node_severity[index] = new_severity
flags[index] = updated_flags
```

### 9.3 edge.added

```text
source_index = node_id_table[source]
target_index = node_id_table[target]
edge_source.push(source_index)
edge_target.push(target_index)
edge_type.push(type)
out_edges[source_index].add(edge_id)
in_edges[target_index].add(edge_id)
type_index[type].add(edge_id)
```

### 9.4 edge.updated

```text
edge_status[edge_id] = new_status
edge_weight[edge_id] = new_weight
```

If edge type changes, update the type index explicitly.

### 9.5 conflict.detected

```text
node_status[target_index] = S
conflict_bitset[target_index] = 1
routing_masks.update(target_index)
inhibition_index.update(conflict_relation)
```

Conflict is not only visual state.

Conflict affects graph routing.

---

## 10. Activation spreading

A query or event activates an initial frontier:

```text
a_0 = ψ(e_t)
```

Then activation spreads through selected typed edges:

```text
a_{k+1} = clip(a_k + Σ α_r A^(r) a_k)
```

Where:

| Symbol | Meaning |
|---|---|
| `a_k` | activation vector at step `k` |
| `A^(r)` | typed adjacency for edge type `r` |
| `α_r` | relation weight |
| `clip` | range limiter |

This simple form may over-activate dense project regions.

Therefore mature Mission Control should support damping and inhibition.

---

## 11. Lateral inhibition clause

To prevent activation explosion, use damped spreading with inhibition:

```text
a_{k+1} = clip(γ a_k + Σ α_r A^(r) a_k - β W_inh a_k)
```

Where:

| Symbol | Meaning |
|---|---|
| `γ` | damping / decay |
| `β` | inhibition strength |
| `W_inh` | inhibition relation index |

Engineering meaning:

```text
semantic signal spreads through relevant relations,
but conflicting, exclusive or irrelevant paths suppress each other.
```

This keeps projection focused.

---

## 12. Sparse inhibition

`W_inh` must not be implemented as a dense `n x n` matrix for large graphs.

Use sparse typed inhibition channels:

```text
W_inh_conflict
W_inh_exclusive_path
W_inh_stale_branch
W_inh_scope_boundary
```

Possible representation:

```text
inhibition_pairs:
  node_i -> [(node_j, weight), ...]
```

Or:

```text
typed_inhibition_index:
  inhibition_type -> [(source, target, weight), ...]
```

Inhibition should be processed through adjacency-like ranges so it remains cache-friendly.

---

## 13. Quad Logic routing clause

Mission Control must preserve Semantic Quad Logic.

```text
T = true / verified
F = false / rejected condition
N = unknown / insufficient information
S = conflict / contradiction / paradox
```

The state vector may be represented as:

```text
s_i = [T_i, F_i, N_i, S_i]
```

Important law:

```text
S != Warning
```

`S` is not a warning badge.

`S` is a routing condition.

When a node enters S-state:

```text
conflict_bitset[i] = 1
routing masks must update
proof transit may be blocked
conflict paths must become inspectable
```

A conflict changes how the graph can be traversed and projected.

It is not merely a visual decoration.

---

## 14. Projection modes

Different Mission Control modes use the same Turbovec index but different projection queries.

Examples:

### 14.1 Conflict mode

```text
R_conflict = { violates, conflicts_with, proves, depends_on }
```

Shows:

- conflict nodes;
- blocked proof paths;
- violated invariants;
- affected functions;
- verdict impact.

### 14.2 Effect mode

```text
R_effect = { emits, writes, reads, guards }
```

Shows:

- effects;
- IO boundaries;
- guarded paths;
- write/read dependencies.

### 14.3 Verdict mode

```text
R_verdict = { proves, violates, guards, resolves_to }
```

Shows:

- why Admission Guard produced the verdict;
- proof chain;
- conflict chain;
- blocking node path.

### 14.4 Focus mode

Shows the local neighborhood of the selected node, constrained by relation types and depth.

### 14.5 Diff mode

Shows changed, dirty, affected and stale nodes from a PR or local change.

---

## 15. Visible graph law

Mission Control must not always render the whole project.

The visible graph is a projection:

```text
P_t = Π_q(I_t)
```

And:

```text
P_t ⊆ G_t
```

Meaning:

```text
the visible graph is not the full graph;
it is an active semantic slice of the full graph.
```

Renderer receives `P_t`, not the entire canonical state by default.

---

## 16. Cost model

Full rendering path:

```text
Cost_full = O(|V| + |E| + Layout(|V|, |E|) + Render(|V|, |E|))
```

Turbovec projection path:

```text
Cost_turbo = O(|ΔE| + k * |Frontier| + Layout(|U|, |E_U|) + Render(|U|, |E_U|))
```

Where:

| Symbol | Meaning |
|---|---|
| `ΔE` | new event delta |
| `k` | propagation depth |
| `Frontier` | active boundary |
| `U` | visible nodes |
| `E_U` | visible edges |

Expected relation:

```text
|U| << |V|
|E_U| << |E|
```

The performance gain comes from materializing only the active projection.

---

## 17. Time-travel and replay clause

Mission Control supports time-travel through event sourcing.

Primary mechanism:

```text
nearest snapshot <= target event
+ deterministic forward replay
```

Not primary mechanism:

```text
reverse delta rollback as source of truth
```

Formal rule:

```text
TimeTravel(τ) = ReplayForward(Snapshot_max(c_i <= τ), Events_{c_i+1:τ})
```

Where `τ` is the target event index or logical time.

---

## 18. Why forward replay is canonical

Forward replay from snapshot is preferred because it:

- preserves event-sourced determinism;
- works cleanly with tombstones;
- works cleanly with generation handles;
- survives compaction boundaries;
- avoids accumulating reverse-patch errors;
- is easier to audit;
- is easier to compare against full rebuild.

Reverse patches are allowed only as optimization.

---

## 19. Reverse patches are optimization only

Mission Control may maintain a short reverse-patch ring buffer for local UI convenience.

Example:

```text
ReversePatchRing
├─ event_id
├─ previous_node_status
├─ previous_edge_status
├─ previous_bitset_values
├─ previous_adjacency_slot
└─ generation guard
```

Allowed use:

```text
step back a few events
local replay debugging
short rewind inside current session
```

Forbidden use:

```text
reverse patches as canonical audit mechanism
reverse patches as long-range time-travel authority
reverse renderer history as replay truth
```

Reverse patch law:

```text
ReversePatch = OptimizationOnly
```

---

## 20. Snapshot contents

A replay snapshot should contain enough state to resume deterministic forward replay.

Minimum snapshot state:

```text
canonical graph state
Turbovec packed arrays
semantic_id -> dense index map
generation arrays
active bitsets
tombstone bitsets
routing masks
conflict masks
unknown masks
compaction epoch
schema version
last_event_id
```

Snapshots must be versioned.

Snapshot schema migration must be explicit.

---

## 21. Compaction boundary rule

Compaction may rewrite dense indices.

Therefore dense indices must not be treated as stable public identity.

Recommended rule:

```text
compaction requires or creates a snapshot boundary
```

After compaction:

- Semantic IDs remain stable;
- dense indices may change;
- generation policy must be updated;
- replay should resume from the post-compaction snapshot;
- renderer should receive new projection handles.

---

## 22. Correctness oracle

Full rebuild remains the correctness oracle.

For a target time `t`:

```text
I_t_delta == Φ(G_t)
```

Where:

| Term | Meaning |
|---|---|
| `I_t_delta` | index produced by delta patching |
| `Φ(G_t)` | index produced by full rebuild from canonical graph |

Use full rebuild for:

- tests;
- recovery;
- schema migration;
- corruption detection;
- periodic validation;
- compacted snapshot validation.

---

## 23. DNA laws added by this appendix

```text
[ ] Turbovec index is acceleration, not semantic authority
[ ] Runtime updates use delta patching where possible
[ ] Delta patching must be equivalent to canonical rebuild
[ ] Semantic IDs are canonical; dense indices are internal
[ ] Deletions use tombstones before compaction
[ ] NodeHandle must include generation if dense handles are retained
[ ] S-state updates routing masks, not only visual status
[ ] Lateral inhibition may focus activation but cannot redefine truth
[ ] Visible graph is a projection P_t, not full graph G_t
[ ] Forward replay from snapshot is canonical time-travel
[ ] Reverse patches are local optimization only
[ ] Compaction creates or requires a snapshot boundary
[ ] Renderer animation history is not replay history
```

---

## 24. Codex guardrails for Turbovec work

When giving Codex Turbovec-related tasks, include:

```text
Preserve Mission Control DNA:
- Semantic owns meaning.
- Admission Guard owns admission.
- Mission Control owns observation.
- Turbovec accelerates graph access only.
- Renderer owns projection only.
- Do not make dense indices canonical.
- Do not make S-state a warning.
- Do not make reverse patches replay authority.
- Keep delta updates equivalent to full rebuild.
- Keep compaction behind snapshot boundaries.
```

Any shortcut must be documented as temporary.

---

## 25. North Star extension

Mission Control should not carry the entire world into the renderer.

It should activate the relevant semantic region and materialize only what matters.

Final principle:

```text
Mission Control keeps a compact semantic field,
activates the area of meaning touched by the event or query,
and renders only the resulting projection.
```

This is how Mission Control becomes a real-time semantic instrument instead of a decorative dependency viewer.
