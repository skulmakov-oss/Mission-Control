import type { GraphState } from "../domain/events";

type StatsPanelProps = {
  graphState: GraphState;
};

export function StatsPanel({ graphState }: StatsPanelProps) {
  const verifiedNodes = graphState.nodes.filter((node) => node.status === "verified" || node.status === "admitted").length;
  const activeChecks = graphState.nodes.filter((node) => node.status === "checking" || node.status === "scanning").length;

  return (
    <section className="panel stats-panel">
      <div className="panel-header">
        <span className="eyebrow">Run state</span>
        <strong>{graphState.status}</strong>
      </div>

      <div className="stat-grid">
        <div>
          <span>Nodes</span>
          <strong>{graphState.nodes.length}</strong>
        </div>
        <div>
          <span>Edges</span>
          <strong>{graphState.links.length}</strong>
        </div>
        <div>
          <span>Conflicts</span>
          <strong>{graphState.conflicts.length}</strong>
        </div>
        <div>
          <span>Active</span>
          <strong>{activeChecks}</strong>
        </div>
        <div>
          <span>Verified</span>
          <strong>{verifiedNodes}</strong>
        </div>
        <div>
          <span>Verdict</span>
          <strong>{graphState.verdict?.status ?? "—"}</strong>
        </div>
      </div>
    </section>
  );
}
