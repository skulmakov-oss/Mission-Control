# Mission Control Event Protocol

## 1. Purpose

The event protocol defines how Admission Guard, Verifier and Semantic analysis services send information to Mission Control.

Mission Control consumes these events and builds a canonical graph model.

The event stream is intentionally independent from the renderer.

## 2. Event stream form

The first supported interchange format is JSONL / NDJSON.

Each line is a complete event object:

```json
{"event":"node.added","run_id":"pr-0001","timestamp":"2026-06-16T12:00:00Z","node":{"id":"fn:create_slot","kind":"function","label":"create_slot","status":"checking"}}
```

Later transports may include:

- WebSocket messages;
- Tauri IPC;
- local socket stream;
- Semantic Studio plugin channel;
- CI artifact replay.

## 3. Required event fields

Every event must include:

| Field | Meaning |
|---|---|
| `event` | Event type |
| `run_id` | Admission Guard / analysis run identifier |
| `timestamp` | Event timestamp in ISO-8601 format |

## 4. Event types

| Event | Meaning |
|---|---|
| `run.started` | A new analysis/admission run started |
| `run.completed` | The run completed |
| `node.added` | A graph node was discovered |
| `node.updated` | A graph node changed status or metadata |
| `edge.added` | A relation was discovered |
| `edge.updated` | A relation changed status or metadata |
| `check.started` | A verifier/admission check started |
| `check.completed` | A verifier/admission check completed |
| `conflict.detected` | A conflict or S-state was detected |
| `verdict.emitted` | Admission Guard produced a verdict |
| `snapshot.emitted` | A full graph snapshot was emitted |

## 5. Node event example

```json
{
  "event": "node.added",
  "run_id": "pr-0001",
  "timestamp": "2026-06-16T12:00:01Z",
  "node": {
    "id": "module:booking.semantic",
    "kind": "module",
    "label": "booking.semantic",
    "status": "scanning",
    "severity": "none",
    "file": "src/booking.semantic",
    "line_start": 1,
    "line_end": 240
  }
}
```

## 6. Edge event example

```json
{
  "event": "edge.added",
  "run_id": "pr-0001",
  "timestamp": "2026-06-16T12:00:02Z",
  "edge": {
    "id": "edge:create_slot.proves.no_overlap",
    "source": "fn:create_slot",
    "target": "inv:no_overlap",
    "type": "proves",
    "status": "active",
    "direction": "forward",
    "weight": 0.92
  }
}
```

## 7. Conflict event example

```json
{
  "event": "conflict.detected",
  "run_id": "pr-0001",
  "timestamp": "2026-06-16T12:00:03Z",
  "conflict": {
    "id": "conflict:possible_overlap",
    "source": "fn:create_slot",
    "target": "inv:no_overlap",
    "severity": "high",
    "state": "S",
    "message": "Potential slot overlap under concurrent booking path"
  }
}
```

## 8. Verdict event example

```json
{
  "event": "verdict.emitted",
  "run_id": "pr-0001",
  "timestamp": "2026-06-16T12:00:04Z",
  "verdict": {
    "status": "needs_review",
    "reason": "S-state detected in invariant proof path",
    "summary": "Admission Guard paused the PR because no_overlap proof is not stable under concurrent booking path."
  }
}
```

## 9. Determinism rule

The same event stream must produce the same canonical graph.

Renderer animation may differ, but canonical graph state must not.

## 10. Boundary rule

The event protocol carries semantic facts and analysis observations.

It must not carry renderer-only meaning as authority.

Allowed:

```text
node.kind = invariant
node.status = conflict
edge.type = violates
```

Not authoritative:

```text
node.color = red
node.position = [x, y, z]
```

Visual choices belong to projection rules, not core semantic event truth.
