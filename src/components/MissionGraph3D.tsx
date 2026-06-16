import { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph3D from "react-force-graph-3d";
import type { GraphState, VisualLink, VisualNode } from "../domain/events";
import type { SelectedGraphItem } from "./InspectorPanel";

type MissionGraph3DProps = {
  graphState: GraphState;
  onSelect: (item: SelectedGraphItem) => void;
};

function linkParticles(link: VisualLink): number {
  if (link.status === "conflict") return 6;
  if (link.type === "proves" || link.type === "emits") return 4;
  if (link.type === "calls") return 2;
  return 0;
}

function linkWidth(link: VisualLink): number {
  if (link.status === "conflict") return 3;
  if (link.type === "writes" || link.type === "violates") return 2.4;
  return 1.4;
}

export function MissionGraph3D({ graphState, onSelect }: MissionGraph3DProps) {
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dim, setDim] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setDim({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const graphData = useMemo(
    () => ({
      nodes: graphState.nodes,
      links: graphState.links,
    }),
    [graphState.links, graphState.nodes],
  );

  useEffect(() => {
    if (!graphRef.current || graphState.nodes.length === 0) return;

    graphRef.current.d3Force("charge")?.strength(-180);
    graphRef.current.d3Force("link")?.distance((link: VisualLink) => {
      if (link.type === "contains") return 70;
      if (link.type === "proves") return 120;
      if (link.status === "conflict") return 160;
      return 100;
    });
  }, [graphState.nodes.length, graphState.links.length]);

  return (
    <div className="graph-shell" ref={containerRef}>
      {dim.w > 0 && (
        <ForceGraph3D
          ref={graphRef}
          width={dim.w}
          height={dim.h}
          graphData={graphData}
          backgroundColor="rgba(2, 6, 23, 0)"
        nodeAutoColorBy={undefined}
        nodeId="id"
        nodeVal={(node: VisualNode) => node.val}
        nodeColor={(node: VisualNode) => node.color}
        nodeLabel={(node: VisualNode) => `${node.kind}: ${node.label}\n${node.status}`}
        linkSource="source"
        linkTarget="target"
        linkColor={(link: VisualLink) => link.color}
        linkWidth={(link: VisualLink) => linkWidth(link)}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkDirectionalParticles={(link: VisualLink) => linkParticles(link)}
        linkDirectionalParticleWidth={(link: VisualLink) => (link.status === "conflict" ? 4 : 2)}
        linkDirectionalParticleSpeed={(link: VisualLink) => (link.status === "conflict" ? 0.012 : 0.006)}
        onNodeClick={(node: VisualNode) => onSelect({ type: "node", value: node })}
        onLinkClick={(link: VisualLink) => onSelect({ type: "edge", value: link })}
        enableNodeDrag
        cooldownTicks={80}
      />
      )}

      <div className="graph-overlay">
        <span>3D Semantic Projection</span>
        <strong>rotate / zoom / inspect</strong>
      </div>
    </div>
  );
}
