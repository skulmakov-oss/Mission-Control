# Mission Control Architecture

## 1. Purpose

Mission Control is a visual observability subsystem for Semantic projects.

It receives semantic events from Admission Guard, Verifier, Semantic Analyzer and future Semantic Studio services. These events are transformed into a canonical semantic graph and then projected into an interactive 3D scene.

Mission Control is not the owner of Semantic truth. It observes, models and displays it.

## 2. High-level flow

```text
Semantic source / PR diff
        ↓
Admission Guard
        ↓
Semantic Analyzer
        ↓
Verifier / Invariant Scanner / Conflict Scanner
        ↓
Graph Event Emitter
        ↓
Mission Control Core
        ↓
Visual Projection Layer
        ↓
3D Scene / Inspector / Timeline / Replay
```

## 3. Layer model

### 3.1 Producer layer

Event producers may include:

- Semantic parser
- Semantic resolver
- Admission Guard
- Verifier
- Invariant scanner
- Conflict scanner
- Effect boundary analyzer
- Proof-path tracer

Producer components emit semantic events. They should not know how Mission Control renders the graph.

### 3.2 Canonical graph layer

The canonical graph layer stores meaning, not visuals.

Node examples:

- module
- namespace
- type
- function
- contract
- invariant
- rule
- effect
- guard
- proof
- conflict
- verdict
- artifact

Edge examples:

- imports
- calls
- reads
- writes
- depends_on
- proves
- violates
- conflicts_with
- guards
- emits
- resolves_to
- contains

### 3.3 Visual projection layer

The visual projection layer maps semantic meaning into display instructions:

- color
- size
- opacity
- pulse
- particles
- arrows
- layer depth
- camera focus
- inspector data

This layer is replaceable. A future renderer can change without changing semantic meaning.

### 3.4 Rendering adapter

Possible v1 renderer:

```text
React + TypeScript + react-force-graph-3d + Three.js
```

Possible mature direction:

```text
Semantic visual rules -> rendering adapter -> WebGL/WebGPU scene
```

## 4. v1 architecture

v1 is an external technical prototype.

```text
Admission Guard mock/real stream
        ↓ JSONL / WebSocket / IPC
Mission Control TypeScript graph store
        ↓
3D graph renderer
        ↓
Mission Control window
```

v1 validates:

- event protocol;
- 3D dependency graph UX;
- live updates;
- graph replay;
- inspector behavior;
- node and edge taxonomy;
- visual grammar for Semantic states.

## 5. v2 architecture

v2 is Semantic-native.

```text
MissionControl.semantic
        ↓
Semantic graph rules
        ↓
Semantic visual projection rules
        ↓
Renderer adapter
        ↓
3D scene
```

TypeScript, Rust, Tauri and WebGL may still exist as infrastructure, but they must not own semantic meaning.

## 6. 3D semantic layering

Default Z-axis projection:

```text
Z +300    Admission Guard verdicts
Z +200    Invariants / Contracts
Z +100    Functions / Rules
Z   0     Modules / Types
Z -100    Effects / External boundary
Z -200    Conflicts / Unknown / S-state
```

This allows the graph to be read as a spatial causal model:

```text
upper layer  -> proof, admission, guarantees
middle layer -> source structure and logic
lower layer  -> effects, risks, conflicts
```

## 7. Visual semantics

| Semantic state | Visual behavior |
|---|---|
| pending | dim node |
| scanning | soft pulse |
| checking | active pulse |
| verified | stable glow |
| warning | yellow halo |
| conflict | red core / vibration |
| unknown | translucent node |
| admitted | final green arc |
| rejected | broken proof path / red outline |
| needs_review | amber review arc |

## 8. Navigation contract

A graph node must be traceable back to code.

Example:

```text
node id: inv:no_overlap
file: src/booking.semantic
line: 128
symbol: invariant no_overlap
```

Clicking the node in Mission Control should open the corresponding source location in Semantic Studio.

## 9. Replay contract

Mission Control must support replay of a previous Admission Guard run.

Two data forms are required:

```text
event stream -> live visualization
snapshot     -> saved graph state
```

Replay must be deterministic: the same event stream should rebuild the same canonical graph.

## 10. Design rule

Mission Control is not UI decoration.

It is an engineering instrument for observing semantic causality, dependency activation, invariant proof, conflict emergence and Admission Guard decision paths.
