# Mission Control Roadmap

Mission Control is the semantic observability and simulation cockpit for the Semantic ecosystem.

Roadmap rule:

```text
Semantic owns meaning.
Admission Guard owns admission.
Mission Control owns observation.
Turbovec accelerates access.
Renderer displays projection.
Hypothesis owns no authority.
```

Operational rule:

```text
Admission Guard decides.
Mission Control observes.
Semantic protocol connects them.
```

This roadmap must stay aligned with the Mission Control DNA doctrine set:

- `Mission_Control_DNA_Doctrine_Summary.md`
- `Mission_Control_DNA.md`
- `Mission_Control_DNA_Turbovec_Appendix.md`
- `Mission_Control_DNA_WhatIf_Appendix.md`

---

## Priority ladder

```text
P0 — runtime backbone
P1 — developer value modes
P2 — advanced observability modes
P3 — simulation and future-facing modes
```

Feature work must not skip P0.

Every feature must preserve the authority boundary.

---

## P0 — Runtime backbone

Goal: make Mission Control truthful before making it powerful.

Core flow:

```text
JSONL event source
  -> event parser
  -> canonical graph reducer
  -> renderer-independent graph state
  -> visual projection
  -> 3D renderer / inspector / replay
```

Required capabilities:

- read mock JSONL event stream;
- import local JSONL event stream;
- feed mock and imported events into the same reducer;
- build canonical graph state;
- render graph in 3D;
- support free camera rotation;
- show node and edge inspector;
- show run status;
- support deterministic replay from event stream.

Minimal event contract:

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

Acceptance criteria:

- `npm run build` passes;
- `npm run dev` opens the prototype;
- mock JSONL replay works;
- imported/local JSONL replay works;
- nodes appear progressively;
- edges show direction and relation type;
- conflict nodes are visually distinct;
- clicking a node opens inspector data;
- replay produces the same canonical graph state deterministically;
- graph state remains independent from renderer objects.

Non-goals:

- no Turbovec packed index internals yet;
- no What-If overlays yet;
- no Agent Trace hologram yet;
- no Tauri packaging yet;
- no Semantic Studio integration yet.

---

## P1 — Developer value modes

Goal: make Mission Control immediately useful for PR review and debugging.

### P1.1 Semantic Diff Mode

Goal: show what changed in project meaning, not only text.

Questions answered:

```text
What changed semantically?
Which functions changed behavior?
Which contracts or invariants became affected?
Which effects gained or lost paths?
Which graph nodes became dirty, stale or affected?
```

Expected view:

```text
text diff
  -> semantic event delta
  -> changed graph slice
  -> affected invariants / effects / verdict path
```

Acceptance criteria:

- changed nodes are visible;
- affected nodes are visible;
- semantic delta can be inspected;
- text diff and semantic diff remain distinct;
- Mission Control does not decide whether the change is admissible.

### P1.2 Blast Radius Mode

Goal: show the impact radius of a change.

Radius model:

```text
R0 — directly changed entities
R1 — direct dependencies
R2 — affected invariants / contracts
R3 — effects / external boundaries
R4 — verdict / admission impact
```

Questions answered:

```text
What did this change touch?
How far does the impact propagate?
Which invariants must be checked?
Which effects might change?
Which areas require review?
```

Acceptance criteria:

- selected change produces a visible impact wave;
- radius levels are distinguishable;
- inspector explains why each node is included;
- radius is derived from canonical graph state, not renderer state.

### P1.3 Proof Path Explorer

Goal: explain Admission Guard verdict paths.

Questions answered:

```text
Why was this admitted?
Why was this rejected?
Why does this need review?
Where did the proof path break?
Which invariant blocked the decision?
```

Expected path:

```text
verdict
  -> check
  -> invariant / contract
  -> proof path
  -> functions / effects
  -> conflict or admission result
```

Acceptance criteria:

- verdict node can focus proof path;
- proof edges are distinguishable;
- broken proof paths are visible;
- verdict explanation is sourced from Admission Guard events.

### P1.4 Causality Lens

Goal: show cause and consequence chains.

Questions answered:

```text
What caused this conflict?
What did this node affect?
What is primary cause vs downstream effect?
What path led to the final verdict?
```

Acceptance criteria:

- selected node can show incoming causes;
- selected node can show outgoing consequences;
- conflict node can show its causal chain;
- causality is event/graph-derived, not hand-authored UI text.

---

## P2 — Advanced observability modes

Goal: make Mission Control useful for large systems, repeated runs and AI-assisted development.

### P2.1 Snapshot Compare

Goal: compare two graph states.

Use cases:

```text
before PR vs after PR
before Admission Guard vs after Admission Guard
canonical state vs hypothesis branch
run A vs run B
```

Acceptance criteria:

- added nodes are visible;
- removed or stale nodes are visible;
- status changes are visible;
- changed proof paths are visible;
- changed conflict paths are visible;
- comparison reads snapshots / event logs, not renderer history.

### P2.2 Trust Heatmap

Goal: show the reliability state of project regions.

States:

```text
verified
stable
recently changed
needs_review
unknown
conflict
stale
```

Acceptance criteria:

- heatmap is derived from canonical statuses;
- S-state remains distinct from warning;
- unknown state remains distinct from conflict;
- heatmap does not create semantic truth.

### P2.3 Replay Narrative

Goal: make replay explainable in text alongside the graph.

Expected narrative:

```text
1. Run started
2. Module loaded
3. Function activated
4. Invariant checked
5. Conflict detected
6. Verdict emitted
```

Acceptance criteria:

- replay timeline can be read as a sequence;
- narrative links to graph nodes and edges;
- narrative is generated from event log;
- renderer animation history is not replay history.

### P2.4 Semantic Bookmarks

Goal: allow saving meaningful points in a run.

Examples:

```text
before conflict
after guard check
before agent patch
after hypothesis branch
before verdict
```

Acceptance criteria:

- bookmark references event index or snapshot;
- bookmark can restore view context;
- bookmark does not mutate canonical graph state;
- bookmarks can be used in review notes.

### P2.5 Semantic Layers Toggle

Goal: keep dense graphs readable.

Layer filters:

```text
modules
functions
contracts
invariants
effects
conflicts
verdicts
agent trace
hypotheses
```

Acceptance criteria:

- layers can be toggled independently;
- hidden visual layers do not remove canonical graph state;
- inspector can explain hidden/visible state;
- projection mode remains downstream from graph state.

### P2.6 Why This Node? Inspector

Goal: explain why a node is visible in the current projection.

Possible reasons:

```text
selected directly
affected by changed function
part of proof path
part of conflict path
connected to verdict
activated by agent trace
included by current projection mode
```

Acceptance criteria:

- inspector shows inclusion reason;
- inclusion reason is derived from projection query;
- selected mode explains its own graph slice.

---

## P2.7 Agent Trace View

Goal: make AI-agent work observable without exposing hidden chain-of-thought.

Mission Control should visualize observable agent events only.

Allowed event classes:

```text
agent.run.started
agent.goal.set
agent.context.scanned
agent.file.opened
agent.symbol.activated
agent.hypothesis.created
agent.patch.proposed
agent.patch.updated
agent.guard.submitted
agent.guard.result.linked
agent.run.completed
```

Questions answered:

```text
What goal was the agent working on?
Which files and symbols did it touch?
Which semantic regions were activated?
Which patch did it propose?
What did Admission Guard decide?
```

Boundary:

```text
Agent proposes.
Admission Guard decides.
Mission Control reveals.
```

Acceptance criteria:

- agent trace is visually distinct from canonical graph;
- hidden model reasoning is not required or exposed;
- trace events are observable tool/action events;
- agent overlay has no admission authority.

---

## P3 — Simulation and future-facing modes

Goal: turn Mission Control into a semantic flight simulator without weakening canonical truth.

### P3.1 What-If UI

Goal: explore alternative semantic futures.

Rules:

```text
What-If does not rewrite history.
What-If creates an isolated hypothesis branch.
Hypothesis owns no authority.
```

Expected flow:

```text
TimeTravel(τ)
  -> restore canonical state
  -> fork hypothesis branch
  -> apply hypo.* overlay events
  -> render hypothesis projection
  -> submit candidate to Admission Guard if desired
```

Acceptance criteria:

- hypothesis uses `hypo.*` namespace;
- `hypo.verdict` never equals `verdict.emitted`;
- hypothesis projection is visually distinct;
- branch discard has no side effects;
- promotion requires Admission Guard validation.

### P3.2 Risk Budget

Goal: show structural risk profile of a PR or patch.

Example profile:

```text
changed nodes: 12
affected invariants: 4
affected effects: 2
unknown states: 1
conflicts: 0
external boundaries touched: yes
```

Acceptance criteria:

- risk profile is descriptive, not authoritative;
- risk does not replace Admission Guard verdict;
- profile links to graph nodes and proof/conflict paths.

### P3.3 Holographic Slice

Goal: view a focused 3D cross-section of project, agent or admission activity.

Slice examples:

```text
last 30 events
agent-touched nodes only
conflict path only
verdict path only
changed PR region only
hypothesis branch only
```

Acceptance criteria:

- slice is derived from projection query;
- slice can be rotated and inspected;
- slice can be replayed over time;
- slice does not mutate canonical graph state.

### P3.4 Agent Trace Hologram

Goal: show AI-agent activity as a holographic overlay over the project graph.

Expected visualization:

```text
agent goal
  -> activated context
  -> candidate patch
  -> affected graph region
  -> Admission Guard submission
  -> verdict path
```

Acceptance criteria:

- agent overlay is distinguishable from canonical project state;
- agent events are observable actions, not hidden reasoning;
- agent patch path can be compared with proof and conflict paths;
- Admission Guard remains the only admission authority.

---

## Product phases

## Phase 0 — Foundation

Goal: define Mission Control as a future Semantic Studio observability module.

Deliverables:

- README
- architecture document
- event protocol document
- JSON schema for graph events
- mock Admission Guard event stream
- first Semantic-native v2 sketch
- Mission Control DNA doctrine set
- roadmap feature-mode backlog

## Phase 1 — v1 external prototype

Goal: build a standalone 3D visualizer with a truthful runtime backbone.

Scope:

- complete P0 runtime backbone;
- read JSONL mock event stream;
- import local JSONL event stream;
- build canonical graph state;
- render graph in 3D;
- support free camera rotation;
- show node and edge inspector;
- show run status;
- support replay from event stream.

Suggested stack:

```text
Vite + React + TypeScript + Three.js / react-force-graph-3d
Tauri later for desktop shell
```

Acceptance criteria:

- a mock Admission Guard run builds the graph live;
- imported JSONL builds the same reducer path;
- nodes appear progressively;
- edges show direction and relation type;
- conflict nodes are visually distinct;
- clicking a node opens inspector data;
- replay produces the same graph state deterministically.

## Phase 2 — real Admission Guard integration

Goal: connect Mission Control to real Semantic / Admission Guard analysis output.

Scope:

- Admission Guard emits graph events;
- event stream includes file and line metadata;
- graph captures dependencies, invariants, effects and conflicts;
- final verdict appears as a graph node;
- run snapshot can be saved;
- adapters normalize AG output into canonical events.

Acceptance criteria:

- a real PR/check run can be visualized;
- every node can trace back to a Semantic source location;
- conflict and warning states are represented correctly;
- S-state remains distinct from warning;
- graph can be replayed after the run.

## Phase 3 — Semantic Studio plugin shell

Goal: embed Mission Control as a plugin-like panel in Semantic Studio.

Scope:

- plugin host adapter;
- workspace integration;
- editor navigation;
- diagnostics integration;
- Admission Guard run selector;
- graph panel inside Studio;
- source navigation from graph nodes.

Acceptance criteria:

- clicking a graph node navigates to source code;
- selecting a symbol in editor can focus its graph node;
- Admission Guard runs can be viewed inside Studio;
- Studio and standalone views share the same graph model.

## Phase 4 — Mission Control v2 on Semantic

Goal: rewrite Mission Control logic as Semantic-native rules.

Scope:

- `MissionControl.semantic`;
- semantic graph construction rules;
- visual projection rules;
- event interpretation rules;
- conflict and proof-path observers;
- adapter boundary to renderer;
- Semantic-native expression of projection decisions.

Acceptance criteria:

- graph logic is expressed in Semantic;
- visual projection decisions are expressed in Semantic;
- renderer acts only as a technical adapter;
- event replay is deterministic through Semantic rules.

## Phase 5 — mature Semantic Studio module

Goal: turn Mission Control into a native observability subsystem.

Scope:

- persistent graph snapshots;
- graph diff between runs;
- proof-path replay;
- conflict causality tracing;
- CI/PR viewer mode;
- plugin API stabilization;
- optional advanced rendering backend;
- mature P1/P2 feature modes.

Acceptance criteria:

- Mission Control can compare two Admission Guard runs;
- proof and conflict paths are explainable;
- graph snapshots are reproducible;
- Studio and CI views share the same semantic graph model.

## Phase 6 — Semantic Flight Simulator

Goal: support safe What-If Analysis, agent observability and holographic semantic slices.

Scope:

- What-If UI;
- hypothesis branch overlays;
- Agent Trace View;
- Agent Trace Hologram;
- Holographic Slice;
- Risk Budget;
- branch comparison;
- promotion path through Admission Guard.

Acceptance criteria:

- hypothesis branches never mutate canonical event log;
- `hypo.*` events never become canonical events;
- agent trace events remain observable action traces only;
- Admission Guard remains the only promotion path;
- Mission Control can simulate alternative futures without making them true.

---

## Naming notes

Current working name: Mission Control.

Possible future internal modes:

- Dependency Atlas
- ProofScope
- Conflict Radar
- Admission Timeline
- Verifier Lens
- Semantic Observatory
- Causality Lens
- Blast Radius
- Semantic Diff
- Proof Path Explorer
- Trust Heatmap
- Agent Trace Hologram
- Holographic Slice
- Semantic Flight Simulator
