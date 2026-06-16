import type { GraphState, SemanticGraphEdge, SemanticGraphEvent, SemanticGraphNode, VisualLink, VisualNode } from "./events";
import { getLinkColor, getNodeColor, getNodeLayer, getNodeValue } from "./visualRules";

export const emptyGraphState: GraphState = {
  status: "idle",
  nodes: [],
  links: [],
  conflicts: [],
};

function toVisualNode(node: SemanticGraphNode): VisualNode {
  return {
    ...node,
    layer: getNodeLayer(node.kind),
    color: getNodeColor(node.status, node.severity),
    val: getNodeValue(node.kind, node.status),
  };
}

function toVisualLink(edge: SemanticGraphEdge): VisualLink {
  return {
    ...edge,
    color: getLinkColor(edge.type, edge.status),
  };
}

function upsertNode(nodes: VisualNode[], node: SemanticGraphNode): VisualNode[] {
  const visual = toVisualNode(node);
  const existingIndex = nodes.findIndex((candidate) => candidate.id === node.id);

  if (existingIndex === -1) {
    return [...nodes, visual];
  }

  return nodes.map((candidate, index) => (index === existingIndex ? { ...candidate, ...visual } : candidate));
}

function upsertLink(links: VisualLink[], edge: SemanticGraphEdge): VisualLink[] {
  const visual = toVisualLink(edge);
  const existingIndex = links.findIndex((candidate) => candidate.id === edge.id);

  if (existingIndex === -1) {
    return [...links, visual];
  }

  return links.map((candidate, index) => (index === existingIndex ? { ...candidate, ...visual } : candidate));
}

function patchNode(nodes: VisualNode[], nodeId: string, patch: Record<string, unknown>): VisualNode[] {
  return nodes.map((node) => {
    if (node.id !== nodeId) return node;

    const patched = {
      ...node,
      ...patch,
    } as VisualNode;

    return {
      ...patched,
      color: getNodeColor(patched.status, patched.severity),
      val: getNodeValue(patched.kind, patched.status),
    };
  });
}

function patchLink(links: VisualLink[], edgeId: string, patch: Record<string, unknown>): VisualLink[] {
  return links.map((link) => {
    if (link.id !== edgeId) return link;

    const patched = {
      ...link,
      ...patch,
    } as VisualLink;

    return {
      ...patched,
      color: getLinkColor(patched.type, patched.status),
    };
  });
}

export function applyGraphEvent(state: GraphState, event: SemanticGraphEvent): GraphState {
  const base: GraphState = {
    ...state,
    runId: event.run_id,
  };

  switch (event.event) {
    case "run.started":
      return {
        ...base,
        status: "running",
      };

    case "run.completed":
      return {
        ...base,
        status: "completed",
      };

    case "node.added":
      if (!event.node) return base;
      return {
        ...base,
        nodes: upsertNode(base.nodes, event.node),
      };

    case "node.updated":
      if (!event.node_id || !event.patch) return base;
      return {
        ...base,
        nodes: patchNode(base.nodes, event.node_id, event.patch),
      };

    case "edge.added":
      if (!event.edge) return base;
      return {
        ...base,
        links: upsertLink(base.links, event.edge),
      };

    case "edge.updated":
      if (!event.edge_id || !event.patch) return base;
      return {
        ...base,
        links: patchLink(base.links, event.edge_id, event.patch),
      };

    case "conflict.detected":
      return {
        ...base,
        conflicts: event.conflict ? [...base.conflicts, event.conflict] : base.conflicts,
      };

    case "verdict.emitted": {
      if (!event.verdict) return base;

      const verdictNode: SemanticGraphNode = {
        id: `verdict:${event.run_id}`,
        kind: "verdict",
        label: event.verdict.status,
        status: event.verdict.status,
        severity: event.verdict.status === "admitted" ? "none" : "high",
        metadata: {
          reason: event.verdict.reason,
          summary: event.verdict.summary,
        },
      };

      return {
        ...base,
        verdict: event.verdict,
        nodes: upsertNode(base.nodes, verdictNode),
      };
    }

    default:
      console.warn(`[Mission Control] Unsupported event type: ${(event as any).event}`);
      return base;
  }
}
