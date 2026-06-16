# Mission Control v1 Prototype

## Purpose

The v1 prototype validates the first live visualization loop:

```text
mock Admission Guard JSONL
        ↓
JSONL parser
        ↓
graph event reducer
        ↓
canonical graph state
        ↓
3D graph renderer
        ↓
inspector + event log
```

This prototype is intentionally small. It is a working shell for testing the visual language before connecting real Semantic / Admission Guard output.

## Local run

```bash
npm install
npm run dev
```

Open the Vite URL and press **Play**.

## Current user flow

1. The app loads `examples/mock-admission-run.jsonl`.
2. The user starts replay.
3. Events are applied one by one.
4. Nodes and edges appear in the 3D scene.
5. The graph can be rotated and zoomed.
6. Clicking a node or edge opens the inspector.
7. The event log shows the stream history.

## Current prototype boundaries

Included:

- Vite React shell
- TypeScript graph domain model
- JSONL parser
- deterministic reducer for canonical graph state
- visual projection rules
- 3D graph scene
- replay controls
- inspector panel
- event log

Not included yet:

- Tauri desktop shell
- real Admission Guard producer
- WebSocket / IPC stream
- persistent graph snapshots
- graph diff between runs
- source navigation into Semantic Studio
- Semantic-native runtime execution of graph rules

## Next implementation slice

Recommended next slice:

```text
real stream boundary
  -> replace static mock import with EventSource/WebSocket adapter
  -> keep reducer unchanged
  -> keep renderer unchanged
```

This preserves the core principle:

```text
transport changes, semantic graph model stays stable
```
