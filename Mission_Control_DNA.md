# Mission Control DNA

Mission Control DNA is the architectural guide for every Mission Control PR.

It defines what Mission Control is, what it must never become, how it receives project state, how it builds the canonical graph, how it visualizes that graph, and how future PRs must preserve the boundary between Semantic, Admission Guard and Mission Control.

This document is intentionally strict. It exists to prevent short-term prototype decisions from damaging the long-term system design.

---

## 1. Mission statement

Mission Control is the visual observability layer for the Semantic ecosystem.

It is designed to make the internal semantic state of a project visible while code is being designed, checked, admitted and replayed.

Mission Control must show:

- project structure;
- dependencies;
- contracts;
- invariants;
- proof paths;
- effects;
- conflicts;
- unknown states;
- Admission Guard checks;
- Admission Guard verdicts;
- graph snapshots;
- run replay.

Mission Control is not a compiler, not a verifier and not an admission authority.

Its role is to observe, normalize, project and explain.

---

## 2. Core formula

```text
Semantic / Admission Guard events
        ↓
canonical graph model
        ↓
visual projection rules
        ↓
3D renderer / inspector / replay
```

The renderer does not own meaning.

The graph reducer does not own admission decisions.

Mission Control consumes semantic events and builds an observability model.

---

## 3. Authority boundary

The most important boundary:

```text
Admission Guard decides.
Mission Control observes.
Semantic protocol connects them.
```

Admission Guard owns:

- checks;
- policies;
- rules of admission;
- verdict logic;
- `admitted` / `rejected` / `needs_review` decisions;
- event production for verification and admission traces.

Mission Control owns:

- event intake;
- canonical graph state;
- graph replay;
- visual projection;
- 3D graph rendering;
- timeline;
- inspector;
- source navigation metadata;
- user-facing explanation of received events.

Mission Control must never decide whether a change is admitted.

It may display a verdict, but it must not create verdict authority.

---

## 4. Product forms

Mission Control and Admission Guard will exist in multiple forms.

```text
Semantic
├─ Embedded Admission Guard
└─ canonical Semantic authority

Semantic Studio
├─ Admission Guard component
├─ Mission Control component
└─ shared Studio event bus

Standalone apps
├─ Mission Control App
└─ Admission Guard App
```

### 4.1 Embedded Admission Guard

Embedded Admission Guard lives inside the trusted Semantic path.

It is close to:

- compiler;
- verifier;
- runtime admission;
- invariant checking;
- policy checking.

This is the strongest authority form.

### 4.2 Semantic Studio Admission Guard component

The Studio component is the operator-facing control surface.

It may provide:

- local workspace checks;
- PR / diff checks;
- run controls;
- diagnostics;
- event streaming;
- verdict display;
- handoff to Mission Control.

### 4.3 Mission Control Studio component

Mission Control inside Semantic Studio is the observability surface.

It consumes the same event stream and renders the project state graph inside the Studio environment.

### 4.4 Standalone Mission Control app

The standalone app must be cross-platform.

The initial practical direction:

```text
Vite + React + TypeScript     -> browser prototype
Tauri shell                   -> Windows / Linux / macOS desktop app
Shared event protocol         -> reusable between Studio and standalone apps
```

The standalone app must not require Semantic Studio to run.

### 4.5 Standalone Admission Guard app

The standalone Guard app may later run as:

```bash
admission-guard check ./project --emit-jsonl
admission-guard serve --port 7341
```

It must still use the same admission semantics and event protocol.

---

## 5. Version strategy

### 5.1 v1 — fast external prototype

Mission Control v1 is allowed to use common web and desktop tooling.

Expected stack:

```text
Vite
React
TypeScript
Three.js
react-force-graph-3d
JSONL / WebSocket / SSE / IPC adapters
```

Purpose of v1:

- prove the visual loop;
- replay mock JSONL;
- import real Admission Guard JSONL;
- render a 3D state graph;
- provide inspector and event log;
- keep graph meaning independent from renderer details.

v1 must be useful, but not final.

### 5.2 v1.5 — release-grade external instrument

Mission Control v1.5 should become a reliable external instrument.

It should support:

- local JSONL import;
- deterministic replay;
- snapshots;
- graph diff seed;
- basic run archive;
- stable event adapter boundary;
- Tauri packaging preparation.

### 5.3 v2 — Semantic-native Mission Control

Mission Control v2 must move meaning into Semantic.

```text
Mission Control v2
  = Semantic graph logic
  + Semantic event interpretation
  + Semantic visual projection rules
  + external renderer adapter
```

TypeScript, Rust, WebGL and Tauri may remain as infrastructure.

They must not own the semantic meaning.

### 5.4 Final direction

Final Mission Control should be both:

- a Semantic Studio component;
- a standalone cross-platform observability app.

Both must share the same protocol and graph model.

---

## 6. Project state graph

The project state graph is not a simple dependency graph.

It is a canonical semantic map of the project.

It answers:

```text
What exists?
What changed?
What depends on what?
What proves what?
What violates what?
What effects exist?
Where are conflicts?
Why did Admission Guard decide this verdict?
```

The graph must represent project state, not visual decoration.

---

## 7. Canonical graph layers

Mission Control builds the graph in layers.

### 7.1 Structural layer

Represents project shape.

Examples:

- project;
- module;
- namespace;
- type;
- function;
- contract.

Typical edges:

- `contains`;
- `imports`;
- `declares`.

### 7.2 Dependency layer

Represents code and semantic dependencies.

Examples:

- function calls;
- module imports;
- reads;
- writes;
- depends_on.

Typical edges:

- `calls`;
- `reads`;
- `writes`;
- `depends_on`.

### 7.3 Semantic obligation layer

Represents contracts, invariants and obligations.

Examples:

- a function proves an invariant;
- a contract depends on a type;
- an effect is guarded by a capability;
- a rule constrains a state transition.

Typical edges:

- `proves`;
- `guards`;
- `requires`;
- `ensures`;
- `resolves_to`.

### 7.4 Admission layer

Represents Admission Guard activity.

Examples:

- guard check started;
- guard check completed;
- invariant checking;
- proof path active;
- verdict emitted.

Typical nodes:

- guard_check;
- proof_path;
- verdict.

### 7.5 Conflict layer

Represents conflicts, contradictions and S-states.

Examples:

- invariant violation;
- unresolved contradiction;
- ambiguous state;
- conflict path;
- unknown-state boundary.

Typical nodes:

- conflict;
- unknown;
- risk;
- blocked verdict.

---

## 8. Node vocabulary

Canonical node kinds should remain stable.

Initial node kinds:

```text
project
module
namespace
type
function
contract
invariant
rule
effect
guard
check
proof
conflict
unknown
verdict
artifact
snapshot
```

Every node should support:

```text
id
kind
label
status
severity
source location
metadata
```

Suggested TypeScript shape:

```ts
type GraphNode = {
  id: string;
  kind: NodeKind;
  label: string;
  status: NodeStatus;
  severity?: Severity;
  file?: string;
  line_start?: number;
  line_end?: number;
  symbol?: string;
  metadata?: Record<string, unknown>;
};
```

---

## 9. Edge vocabulary

Canonical edge kinds should remain stable.

Initial edge kinds:

```text
contains
imports
calls
reads
writes
depends_on
proves
violates
conflicts_with
guards
emits
resolves_to
requires
ensures
triggers
blocks
```

Every edge should support:

```text
id
source
target
type
status
weight
direction
metadata
```

Suggested TypeScript shape:

```ts
type GraphEdge = {
  id: string;
  source: string;
  target: string;
  type: EdgeKind;
  status?: EdgeStatus;
  weight?: number;
  direction?: "forward" | "backward" | "bidirectional";
  metadata?: Record<string, unknown>;
};
```

---

## 10. Status model

Mission Control must use statuses as semantic observation states, not UI decoration.

Initial node statuses:

```text
pending
scanning
checking
verified
warning
conflict
unknown
admitted
rejected
needs_review
dirty
affected
stale
```

Initial edge statuses:

```text
pending
active
verified
warning
conflict
stale
```

Severity levels:

```text
none
low
medium
high
critical
```

Status changes must arrive through graph events or deterministic graph rules.

Renderer-only hover, selection and camera state must not mutate canonical status.

---

## 11. Stable identity rules

Stable IDs are mandatory.

The graph must not create duplicate nodes for the same semantic entity.

Recommended ID patterns:

```text
project:<project-id>
module:<path>
namespace:<path>:<namespace>
type:<path>:<type-name>
fn:<path>:<function-name>
contract:<path>:<contract-name>
inv:<path>:<invariant-name>
effect:<effect-name>
guard:<run-id>:<check-name>
conflict:<run-id>:<conflict-id>
verdict:<run-id>
artifact:<run-id>:<artifact-name>
```

If an entity changes, emit:

```text
node.updated
```

If an entity is renamed, use a rename or alias event rather than creating an unrelated node:

```text
node.renamed
old_id -> new_id
```

If a node becomes invalid, mark it stale or removed through events.

Do not silently lose identity.

---

## 12. Event-sourced graph construction

Mission Control should build the graph from events.

Do not build graph state only as a large final report.

Preferred model:

```text
old graph state
  + semantic event
  = new graph state
```

This enables:

- live graph construction;
- deterministic replay;
- debugging;
- audit;
- snapshot comparison;
- integration with Admission Guard;
- future Semantic-native reducers.

Initial event types:

```text
run.started
run.completed
node.added
node.updated
node.removed
node.renamed
edge.added
edge.updated
edge.removed
check.started
check.completed
conflict.detected
verdict.emitted
snapshot.emitted
```

---

## 13. Reducer rules

The graph reducer applies semantic events to canonical graph state.

The reducer may:

- add nodes;
- update nodes;
- add edges;
- update edges;
- record conflicts;
- record verdicts;
- mark affected nodes;
- build replay history;
- build snapshots.

The reducer must not:

- call Three.js;
- depend on camera state;
- depend on visual layout coordinates;
- treat color as meaning;
- create admission verdicts independently;
- hide semantic rules inside UI components.

Good reducer boundary:

```text
event -> graph state
```

Bad reducer boundary:

```text
event -> Three.js object -> graph meaning
```

---

## 14. Visual projection rules

Visual projection maps semantic meaning to presentation.

It is downstream from canonical graph state.

It may compute:

- color;
- size;
- opacity;
- pulse;
- particles;
- edge width;
- arrows;
- layer position;
- camera focus target;
- visual grouping.

It must not create semantic truth.

If visual projection is wrong, the canonical graph must remain correct.

---

## 15. 3D layer model

Default spatial projection:

```text
Z +300    verdict / admission layer
Z +200    invariants / contracts
Z +100    functions / rules
Z   0     modules / types
Z -100    effects / boundaries
Z -200    conflicts / unknown / S-state
```

Interpretation:

```text
upper layer  -> guarantees, proof, admission
middle layer -> code structure and logic
lower layer  -> effects, risks, conflicts
```

This is a guide, not a hard-coded final law.

Any change to the layer model must preserve semantic readability.

---

## 16. Visual semantics

Initial visual rules:

| Semantic state | Visual behavior |
|---|---|
| pending | dim node |
| scanning | soft pulse |
| checking | active pulse |
| verified | stable glow |
| warning | yellow / amber halo |
| conflict | red core / vibration |
| unknown | translucent node |
| admitted | final green arc / verdict node |
| rejected | broken proof path / red outline |
| needs_review | amber review arc |
| dirty | marked for re-analysis |
| affected | highlighted impact path |
| stale | faded or archived node |

Edge visual rules:

| Edge type | Visual behavior |
|---|---|
| calls | forward particles |
| proves | upward proof particles |
| violates | red impulse |
| depends_on | stable line |
| writes | thick directed line |
| reads | thin directed line |
| emits | boundary-directed pulse |
| guards | protective arc |
| conflicts_with | unstable red relation |

These rules may evolve, but semantic state must remain independent.

---

## 17. Admission Guard integration

Mission Control consumes Admission Guard output.

Initial supported intake:

```text
mock JSONL
imported JSONL file
pasted JSONL
local file picker
```

Future supported intake:

```text
stdout pipe
WebSocket
SSE / EventSource
Tauri IPC
Semantic Studio event bus
CI artifact replay
```

Mission Control should not require one fixed transport.

Transport adapters must feed the same reducer.

Correct shape:

```text
mock JSONL adapter
real JSONL adapter
WebSocket adapter
Tauri IPC adapter
Studio event bus adapter
        ↓
same canonical graph reducer
```

Incorrect shape:

```text
one reducer for mock
another reducer for WebSocket
another hidden reducer for Studio
```

---

## 18. Minimal Admission Guard event contract

Mission Control v1 should initially require only a minimal contract.

Required useful events:

```text
run.started
node.added
node.updated
edge.added
edge.updated
conflict.detected
verdict.emitted
run.completed
```

Optional enrichment:

```text
check.started
check.completed
snapshot.emitted
node.renamed
node.removed
edge.removed
artifact.emitted
```

If Admission Guard emits richer events, Mission Control may display them.

But Mission Control must not require unnecessary richness for the basic graph to work.

---

## 19. Snapshot and replay

Mission Control must support two forms of state:

```text
event log -> what happened
snapshot  -> resulting graph state
```

Event logs are for:

- replay;
- debugging;
- audit;
- deterministic reconstruction;
- time travel;
- future PR review.

Snapshots are for:

- fast loading;
- run comparison;
- graph diff;
- persistence;
- CI artifact inspection.

Rule:

```text
Same event stream -> same canonical graph state
```

Animations may differ.

Canonical state must not differ.

---

## 20. Incremental project updates

Mission Control should eventually support incremental updates.

Expected update flow:

```text
file changed
  -> mark affected nodes dirty
  -> re-parse changed file
  -> update symbol table
  -> update local edges
  -> propagate impact
  -> re-run affected checks
  -> emit graph patch events
```

Example:

```text
fn:create_slot -> dirty
inv:no_overlap -> affected
effect:calendar_write -> affected
guard_check:no_overlap -> rerun
```

Mission Control visual response:

```text
changed function pulses
invariant enters checking state
proof edge becomes active
conflict or verdict updates
```

No PR should introduce a full rebuild-only assumption unless clearly marked as temporary.

---

## 21. Source navigation contract

Every meaningful node should be traceable back to source when possible.

Required metadata when available:

```text
file
line_start
line_end
symbol
project_root
commit_sha
run_id
```

Clicking a node should eventually support:

```text
open file
jump to line
focus symbol
show diagnostics
show event history for this node
```

Mission Control standalone app may display the location.

Semantic Studio component should navigate directly to source.

---

## 22. Inspector contract

Inspector must explain meaning, not only visual properties.

For a node, inspector should show:

- id;
- kind;
- label;
- status;
- severity;
- source location;
- incoming relations;
- outgoing relations;
- last event;
- related conflicts;
- related verdict impact.

For an edge, inspector should show:

- id;
- type;
- source;
- target;
- status;
- weight;
- direction;
- event source;
- meaning of relation.

For a verdict, inspector should show:

- verdict status;
- reason;
- summary;
- blocking conflicts;
- relevant proof paths;
- affected nodes.

---

## 23. Timeline contract

Mission Control should treat time as a first-class review dimension.

A run should be inspectable as:

```text
event 1 -> event 2 -> event 3 -> ... -> verdict
```

Timeline should support:

- replay;
- pause;
- step;
- jump to event;
- filter by node;
- filter by conflict;
- filter by check;
- filter by verdict path.

Timeline must read from event log, not from renderer animation history.

---

## 24. PR guide: required questions

Every Mission Control PR must answer these questions.

### 24.1 Authority

- Does this PR preserve the boundary that Admission Guard decides and Mission Control observes?
- Does it avoid creating verdict logic in UI or renderer code?
- Does it avoid making color, position or animation authoritative?

### 24.2 Graph model

- Does this PR preserve canonical graph state?
- Are nodes and edges represented as semantic entities?
- Are stable IDs preserved?
- Are duplicate semantic nodes avoided?

### 24.3 Event flow

- Does this PR feed changes through event intake or a clear adapter?
- Can the same event stream be replayed?
- Does the reducer remain renderer-independent?

### 24.4 Visual projection

- Are visual rules downstream from graph state?
- Is the visual change explainable from semantic status or relation type?
- Does the 3D scene remain a projection, not source of truth?

### 24.5 Host independence

- Can this code still evolve toward browser, Tauri, Studio and standalone use?
- Is it avoiding hard-coded host assumptions?
- Are adapters separated from domain logic?

### 24.6 Release quality

- Does `npm run build` pass where applicable?
- Is the smoke path documented?
- Are mock and real-event paths kept compatible?
- Is any limitation clearly documented?

---

## 25. PR checklist

Use this checklist in every PR description.

```text
[ ] Preserves AG authority / MC observability boundary
[ ] Keeps graph reducer independent from renderer objects
[ ] Uses or preserves stable node / edge IDs
[ ] Keeps transport adapters separate from graph domain logic
[ ] Supports deterministic replay where applicable
[ ] Does not encode semantic truth in color / position / animation
[ ] Updates documentation when changing protocol or graph vocabulary
[ ] Keeps future Tauri / Studio / standalone paths open
[ ] Adds or updates smoke instructions when runtime behavior changes
[ ] States known limitations clearly
```

---

## 26. PR categories

Use clear PR categories.

### 26.1 DNA / architecture PR

Changes:

- this file;
- architecture documents;
- roadmap;
- event protocol design.

Must not add runtime behavior unless explicitly scoped.

### 26.2 Protocol PR

Changes:

- event schema;
- node vocabulary;
- edge vocabulary;
- snapshot format;
- adapter contracts.

Must update docs and examples.

### 26.3 Domain PR

Changes:

- graph reducer;
- graph state model;
- replay logic;
- snapshot logic;
- stable ID handling.

Must not depend on renderer internals.

### 26.4 Adapter PR

Changes:

- JSONL import;
- file picker;
- paste input;
- WebSocket;
- SSE;
- Tauri IPC;
- Studio event bus.

Must feed canonical events into the same reducer.

### 26.5 Visual PR

Changes:

- 3D scene;
- visual projection rules;
- inspector UI;
- timeline UI;
- controls;
- styling.

Must not own semantic truth.

### 26.6 Release PR

Changes:

- build setup;
- packaging preparation;
- smoke tests;
- docs;
- platform compatibility;
- release notes.

Must not mix unrelated architecture changes.

---

## 27. Anti-patterns

The following are forbidden unless explicitly marked as temporary and isolated.

### 27.1 UI-owned truth

Bad:

```text
red node -> rejected
```

Good:

```text
verdict.emitted(status: rejected) -> red verdict projection
```

### 27.2 Renderer-coupled graph state

Bad:

```text
Three.js object is the graph node
```

Good:

```text
GraphNode is canonical; Three.js object is a projection
```

### 27.3 Transport-specific reducers

Bad:

```text
mock reducer
websocket reducer
studio reducer
```

Good:

```text
multiple adapters -> one reducer
```

### 27.4 Admission logic in Mission Control

Bad:

```text
Mission Control calculates whether PR is admitted
```

Good:

```text
Mission Control displays Admission Guard verdict
```

### 27.5 One-host lock-in

Bad:

```text
works only as Vite demo forever
```

Good:

```text
domain -> adapters -> renderer -> host shell
```

### 27.6 Hidden Semantic drift

Bad:

```text
Mission Control invents a new meaning for conflict
```

Good:

```text
Mission Control displays conflict from protocol / Semantic rules
```

---

## 28. Codex task guardrails

When giving Codex a task, include the relevant guardrails.

Minimum prompt block:

```text
Preserve Mission Control DNA:
- Admission Guard decides; Mission Control observes.
- Do not move semantic truth into renderer code.
- Keep canonical graph state independent from Three.js / UI objects.
- Feed all transports into the same graph reducer.
- Preserve deterministic replay where applicable.
- Keep future Tauri, Studio and standalone app paths open.
```

Codex may rapidly prototype.

Codex must not erase architectural boundaries.

If Codex chooses a shortcut, it must be documented as temporary.

---

## 29. Testing strategy

Mission Control testing should evolve in layers.

### 29.1 Static parser tests

Validate:

- JSONL parsing;
- invalid line handling;
- required event fields;
- schema compatibility.

### 29.2 Reducer tests

Validate:

- node add/update;
- edge add/update;
- conflict recording;
- verdict node creation;
- stable ID behavior;
- deterministic replay.

### 29.3 Snapshot tests

Validate:

- event stream -> snapshot;
- snapshot load;
- snapshot diff seed;
- stale node handling.

### 29.4 Adapter tests

Validate:

- mock JSONL;
- imported JSONL;
- pasted JSONL;
- future WebSocket / SSE adapters.

### 29.5 UI smoke tests

Validate:

- app opens;
- Play works;
- Step works;
- Replay works;
- graph appears;
- inspector opens node;
- inspector opens edge;
- verdict appears;
- conflict is visible.

---

## 30. Release smoke path

For v1 prototype and early release-track work:

```bash
npm install
npm run build
npm run dev
```

Manual smoke:

```text
open app
press Play
observe nodes appearing
observe edges appearing
click node
click edge
verify event log
verify conflict visualization
verify verdict node
reset
step through events
```

Real Admission Guard smoke:

```text
export or capture AG JSONL
import into Mission Control
replay imported events
verify graph state
verify conflict path
verify verdict path
verify inspector metadata
```

---

## 31. Documentation rules

Any PR that changes protocol or graph meaning must update docs.

Required documentation updates:

- event schema changes;
- node vocabulary changes;
- edge vocabulary changes;
- status model changes;
- adapter behavior changes;
- snapshot format changes;
- source navigation contract changes;
- release smoke path changes.

Documentation-only PRs are allowed and valuable.

They must clearly state that no runtime behavior changed.

---

## 32. Semantic-native future

Mission Control v2 should eventually express graph logic and projection rules in Semantic.

The intended direction:

```semantic
module MissionControl

observe AdmissionRun as run

graph DependencyGraph {
    node GraphNode
    edge GraphEdge
}

rule OnNodeAdded(event) when event.kind == "node.added" {
    DependencyGraph.add_node(event.node)
}

rule OnConflictDetected(event) when event.kind == "conflict.detected" {
    DependencyGraph.mark(event.conflict.target, state: S)
    visual.emit(kind: "conflict_pulse", target: event.conflict.id)
}
```

The exact syntax may evolve.

The design intent must not change:

```text
Semantic owns meaning.
Renderer displays projection.
```

---

## 33. Relationship to Admission Guard

Admission Guard has already proven itself as the checking authority in local project testing.

Mission Control's immediate job is to come online as a reliable instrument around that authority.

Near-term target:

```text
AG JSONL output
  -> Mission Control import
  -> canonical graph reducer
  -> 3D graph
  -> inspector
  -> replay
```

Do not modify Admission Guard just to satisfy a UI shortcut.

Instead, write adapters.

---

## 34. Relationship to Semantic Studio

Semantic Studio should eventually host both:

- Admission Guard component;
- Mission Control component.

Studio-level flow:

```text
User runs Admission Guard
        ↓
AG component emits semantic events
        ↓
Shared Studio event bus
        ↓
Mission Control builds graph
        ↓
User inspects proof / conflict / verdict path
```

Studio integration must preserve the same DNA:

```text
AG decides.
MC observes.
Protocol connects.
```

---

## 35. Definition of done for Mission Control PRs

A PR is acceptable only if it preserves the system DNA.

Minimum DoD:

```text
[ ] scope is clear
[ ] authority boundary preserved
[ ] graph state remains canonical
[ ] renderer remains projection-only
[ ] protocol compatibility considered
[ ] replay impact considered
[ ] source navigation impact considered
[ ] host independence considered
[ ] docs updated if meaning changed
[ ] limitations stated
```

For runtime PRs:

```text
[ ] npm install works or dependency changes are explained
[ ] npm run build passes or failure is documented
[ ] npm run dev smoke path works or limitation is documented
[ ] mock replay path preserved
[ ] real event path not blocked
```

---

## 36. North Star

Mission Control should feel like an engineering instrument, not a decorative graph.

It should become a live 3D X-ray of a Semantic project.

The user should be able to see:

```text
what changed
what depends on it
what proves it
what it breaks
what effects it emits
where conflict appears
why Admission Guard gave its verdict
```

The final standard:

```text
Mission Control must make semantic causality visible.
```
