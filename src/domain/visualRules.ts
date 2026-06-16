import type { EdgeKind, EdgeStatus, NodeKind, NodeStatus, Severity } from "./events";

const layerByKind: Record<NodeKind, number> = {
  verdict: 300,
  invariant: 200,
  contract: 200,
  function: 100,
  rule: 100,
  module: 0,
  namespace: 0,
  type: 0,
  guard: 180,
  proof: 240,
  artifact: -50,
  effect: -100,
  conflict: -200,
};

const colorByStatus: Record<NodeStatus, string> = {
  pending: "#64748b",
  scanning: "#38bdf8",
  checking: "#a78bfa",
  verified: "#22c55e",
  warning: "#facc15",
  conflict: "#ef4444",
  unknown: "#94a3b8",
  admitted: "#22c55e",
  rejected: "#dc2626",
  needs_review: "#f59e0b",
};

const linkColorByType: Record<EdgeKind, string> = {
  imports: "#64748b",
  calls: "#38bdf8",
  reads: "#60a5fa",
  writes: "#fb7185",
  depends_on: "#a78bfa",
  proves: "#22c55e",
  violates: "#ef4444",
  conflicts_with: "#ef4444",
  guards: "#14b8a6",
  emits: "#f97316",
  resolves_to: "#818cf8",
  contains: "#475569",
};

export function getNodeLayer(kind: NodeKind): number {
  return layerByKind[kind] ?? 0;
}

export function getNodeColor(status: NodeStatus, severity?: Severity): string {
  if (severity === "critical") return "#b91c1c";
  if (severity === "high" && status !== "verified") return "#ef4444";
  if (severity === "medium" && status !== "verified") return "#f97316";
  return colorByStatus[status] ?? "#94a3b8";
}

export function getLinkColor(type: EdgeKind, status?: EdgeStatus): string {
  if (status === "conflict") return "#ef4444";
  if (status === "warning") return "#facc15";
  return linkColorByType[type] ?? "#64748b";
}

export function getNodeValue(kind: NodeKind, status: NodeStatus): number {
  if (kind === "verdict") return 12;
  if (kind === "conflict") return 10;
  if (kind === "invariant" || kind === "contract") return 8;
  if (status === "conflict" || status === "needs_review") return 9;
  return 5;
}
