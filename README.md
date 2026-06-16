# Mission Control

**Mission Control** is a live visual observability layer for the Semantic ecosystem.

It is designed to show how Semantic code, dependencies, contracts, invariants, effects, conflicts, proof paths and Admission Guard verdicts interact with each other in real time.

Mission Control is not intended to be just a dependency viewer. It is a 3D semantic instrument for observing the internal structure of a project while it is being designed, checked and admitted.

```text
Semantic source / PR diff
        ↓
Admission Guard
        ↓
Semantic analysis events
        ↓
Canonical semantic graph
        ↓
3D visual projection
        ↓
Inspector / timeline / replay / source navigation
```

## Current prototype

The repository now contains the first v1 prototype:

```text
Vite + React + TypeScript
react-force-graph-3d / Three.js
JSONL Admission Guard replay
3D semantic graph scene
node / edge inspector
event log
```

Run it locally:

```bash
npm install
npm run dev
```

Then open the Vite URL and press **Play**.

The prototype loads `examples/mock-admission-run.jsonl`, replays the events one by one, builds the canonical graph state and projects it into a rotatable 3D scene.

## Vision

When a developer writes Semantic code or runs a PR through Admission Guard, Mission Control should be able to build a living visual graph of the system:

- modules and symbols appear as graph nodes;
- dependencies appear as directed relations;
- contracts and invariants form proof layers;
- effects are shown at explicit boundary layers;
- conflicts and unknown states are highlighted;
- the final Admission Guard verdict is shown as part of the graph;
- the user can rotate, inspect and replay the structure.

The goal is to make invisible semantic causality visible.

## Core principle

The 3D scene is not the source of truth.

```text
Semantic meaning
        ↓
canonical graph model
        ↓
visual projection rules
        ↓
3D renderer
```

Mission Control must store meaning as a canonical graph model. The renderer only displays that model.

## Version strategy

### v1 — external prototype

Mission Control v1 is a technical prototype used to validate the interaction model, visual language and event protocol.

Expected stack:

```text
Tauri / React / TypeScript
Three.js / react-force-graph-3d
JSONL / WebSocket / IPC event stream
```

v1 may use TypeScript and Rust infrastructure because its purpose is to quickly validate:

- live 3D graph rendering;
- free camera rotation;
- node and edge inspection;
- Admission Guard event replay;
- visual grammar for proofs, conflicts and effects;
- graph snapshot behavior.

### v2 — Semantic-native Mission Control

Mission Control v2 must be written on Semantic.

TypeScript, Rust, WebGL and desktop infrastructure may remain as adapters, but the meaning layer must become Semantic-native:

```text
Mission Control v2
  = Semantic graph logic
  + Semantic event interpretation
  + Semantic visual projection rules
  + external rendering adapter
```

This means that Semantic owns the graph logic, semantic state, visual projection rules and interpretation of Admission Guard events. The renderer only receives projection instructions.

## Planned capabilities

- Live 3D dependency graph
- Free rotation, zoom and camera focus
- Admission Guard run visualization
- Invariant and contract tracing
- Conflict and unknown-state highlighting
- Proof-path visualization
- Effect boundary visualization
- Node and edge inspector
- Navigation back to Semantic source locations
- Run snapshot and deterministic replay
- Future Semantic Studio plugin integration

## Semantic graph vocabulary

Typical node kinds:

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

Typical edge kinds:

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

## Repository layout

```text
Mission-Control/
├─ README.md
├─ package.json
├─ index.html
├─ src/
│  ├─ App.tsx
│  ├─ main.tsx
│  ├─ components/
│  ├─ domain/
│  └─ hooks/
├─ docs/
│  ├─ architecture.md
│  ├─ roadmap.md
│  └─ event-protocol.md
├─ protocol/
│  └─ semantic-graph-event.schema.json
├─ examples/
│  └─ mock-admission-run.jsonl
└─ semantic/
   └─ MissionControl.semantic
```

## Working name

Mission Control is the current working name.

Possible future module or mode names:

- Semantic Observatory
- Dependency Atlas
- ProofScope
- Conflict Radar
- Admission Timeline
- Verifier Lens
- Control Tower

For now, Mission Control describes the whole visual control layer. Individual modes may later receive more specific names.

## Status

Current status: **v1 prototype seed**.

The prototype is intentionally small. It proves the loop:

```text
JSONL events -> graph reducer -> 3D graph -> inspector / event log
```

The next step is to connect the viewer to a real Admission Guard event producer.
