import type { SemanticGraphEvent, VisualLink, VisualNode, GraphState } from "../domain/events";

export type SelectedGraphItem =
  | { type: "node"; value: VisualNode }
  | { type: "edge"; value: VisualLink }
  | undefined;

type InspectorPanelProps = {
  selected: SelectedGraphItem;
  events: SemanticGraphEvent[];
  graphState: GraphState;
};

function formatLocation(node: VisualNode): string {
  if (!node.file) return "No source location";
  const lines = node.line_start ? `:${node.line_start}${node.line_end ? `-${node.line_end}` : ""}` : "";
  return `${node.file}${lines}`;
}

export function InspectorPanel({ selected, events, graphState }: InspectorPanelProps) {
  const outgoingLinks = selected?.type === "node" 
    ? graphState.links.filter((l: any) => (typeof l.source === 'object' ? (l.source as any).id : l.source) === selected.value.id) 
    : [];
  
  const incomingLinks = selected?.type === "node" 
    ? graphState.links.filter((l: any) => (typeof l.target === 'object' ? (l.target as any).id : l.target) === selected.value.id) 
    : [];

  const getTargetName = (link: any) => {
    const tgtId = typeof link.target === 'object' ? link.target.id : link.target;
    const tgtNode = graphState.nodes.find((n: any) => n.id === tgtId);
    return tgtNode ? (tgtNode.label || tgtId) : tgtId;
  };

  const getSourceName = (link: any) => {
    const srcId = typeof link.source === 'object' ? link.source.id : link.source;
    const srcNode = graphState.nodes.find((n: any) => n.id === srcId);
    return srcNode ? (srcNode.label || srcId) : srcId;
  };

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

            {outgoingLinks.length > 0 && (
              <>
                <h4 style={{ marginTop: "16px", marginBottom: "8px", fontSize: "12px", textTransform: "uppercase", color: "#94a3b8" }}>Outgoing Relations</h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "13px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {outgoingLinks.map((l: any) => (
                    <li key={l.id || `${l.type}-${l.source}-${l.target}`} style={{ display: "flex", gap: "6px" }}>
                      <span style={{ color: "#60a5fa", minWidth: "60px" }}>{l.type}</span>
                      <span style={{ color: "#e2e8f0", wordBreak: "break-all" }}>{getTargetName(l)}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {incomingLinks.length > 0 && (
              <>
                <h4 style={{ marginTop: "16px", marginBottom: "8px", fontSize: "12px", textTransform: "uppercase", color: "#94a3b8" }}>Incoming Relations</h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "13px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {incomingLinks.map((l: any) => (
                    <li key={l.id || `${l.type}-${l.source}-${l.target}`} style={{ display: "flex", gap: "6px" }}>
                      <span style={{ color: "#fb923c", minWidth: "60px" }}>{l.type}</span>
                      <span style={{ color: "#e2e8f0", wordBreak: "break-all" }}>{getSourceName(l)}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
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
