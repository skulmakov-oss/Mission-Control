import type { SemanticGraphEvent, VisualLink, VisualNode } from "../domain/events";

export type SelectedGraphItem =
  | { type: "node"; value: VisualNode }
  | { type: "edge"; value: VisualLink }
  | undefined;

type InspectorPanelProps = {
  selected: SelectedGraphItem;
  events: SemanticGraphEvent[];
};

function formatLocation(node: VisualNode): string {
  if (!node.file) return "No source location";
  const lines = node.line_start ? `:${node.line_start}${node.line_end ? `-${node.line_end}` : ""}` : "";
  return `${node.file}${lines}`;
}

export function InspectorPanel({ selected, events }: InspectorPanelProps) {
  return (
    <aside className="side-panel right-panel">
      <section className="panel inspector-panel">
        <div className="panel-header">
          <span className="eyebrow">Inspector</span>
          <strong>{selected ? selected.type : "Nothing selected"}</strong>
        </div>

        {!selected && <p className="muted">Click a node or relation in the 3D graph to inspect semantic metadata.</p>}

        {selected?.type === "node" && (
          <div className="inspect-block">
            <h3>{selected.value.label}</h3>
            <dl>
              <dt>ID</dt>
              <dd>{selected.value.id}</dd>
              <dt>Kind</dt>
              <dd>{selected.value.kind}</dd>
              <dt>Status</dt>
              <dd>{selected.value.status}</dd>
              <dt>Severity</dt>
              <dd>{selected.value.severity ?? "none"}</dd>
              <dt>Source</dt>
              <dd>{formatLocation(selected.value)}</dd>
              <dt>Z layer</dt>
              <dd>{selected.value.layer}</dd>
            </dl>
          </div>
        )}

        {selected?.type === "edge" && (
          <div className="inspect-block">
            <h3>{selected.value.type}</h3>
            <dl>
              <dt>ID</dt>
              <dd>{selected.value.id}</dd>
              <dt>Source</dt>
              <dd>{String(selected.value.source)}</dd>
              <dt>Target</dt>
              <dd>{String(selected.value.target)}</dd>
              <dt>Status</dt>
              <dd>{selected.value.status ?? "pending"}</dd>
              <dt>Weight</dt>
              <dd>{selected.value.weight ?? "—"}</dd>
            </dl>
          </div>
        )}
      </section>

      <section className="panel event-log-panel">
        <div className="panel-header">
          <span className="eyebrow">Event log</span>
          <strong>{events.length} events</strong>
        </div>

        <div className="event-log">
          {[...events].reverse().map((event, index) => (
            <article className="event-row" key={`${event.timestamp}-${event.event}-${index}`}>
              <span>{event.event}</span>
              <small>{event.timestamp.replace("T", " ").replace("Z", "")}</small>
            </article>
          ))}
        </div>
      </section>
    </aside>
  );
}
