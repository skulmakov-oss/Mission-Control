export type NodeKind =
  | "module"
  | "namespace"
  | "type"
  | "function"
  | "contract"
  | "invariant"
  | "rule"
  | "effect"
  | "guard"
  | "proof"
  | "conflict"
  | "verdict"
  | "artifact";

export type EdgeKind =
  | "imports"
  | "calls"
  | "reads"
  | "writes"
  | "depends_on"
  | "proves"
  | "violates"
  | "conflicts_with"
  | "guards"
  | "emits"
  | "resolves_to"
  | "contains";

export type NodeStatus =
  | "pending"
  | "scanning"
  | "checking"
  | "verified"
  | "warning"
  | "conflict"
  | "unknown"
  | "admitted"
  | "rejected"
  | "needs_review";

export type EdgeStatus = "pending" | "active" | "verified" | "warning" | "conflict";

export type Severity = "none" | "low" | "medium" | "high" | "critical";

export type SemanticGraphNode = {
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

export type SemanticGraphEdge = {
  id: string;
  source: string;
  target: string;
  type: EdgeKind;
  weight?: number;
  status?: EdgeStatus;
  direction?: "forward" | "backward" | "bidirectional";
  metadata?: Record<string, unknown>;
};

export type AdmissionVerdict = {
  status: "admitted" | "rejected" | "needs_review";
  reason?: string;
  summary?: string;
};

export type SemanticGraphEvent = {
  event:
    | "run.started"
    | "run.completed"
    | "node.added"
    | "node.updated"
    | "edge.added"
    | "edge.updated"
    | "check.started"
    | "check.completed"
    | "conflict.detected"
    | "verdict.emitted"
    | "snapshot.emitted";
  run_id: string;
  timestamp: string;
  node?: SemanticGraphNode;
  edge?: SemanticGraphEdge;
  node_id?: string;
  edge_id?: string;
  patch?: Partial<SemanticGraphNode | SemanticGraphEdge> & Record<string, unknown>;
  check?: Record<string, unknown>;
  conflict?: Record<string, unknown>;
  verdict?: AdmissionVerdict;
  metadata?: Record<string, unknown>;
};

export type VisualNode = SemanticGraphNode & {
  val: number;
  layer: number;
  color: string;
};

export type VisualLink = SemanticGraphEdge & {
  color: string;
};

export type GraphState = {
  runId?: string;
  status: "idle" | "running" | "completed";
  nodes: VisualNode[];
  links: VisualLink[];
  verdict?: AdmissionVerdict;
  conflicts: Record<string, unknown>[];
};
