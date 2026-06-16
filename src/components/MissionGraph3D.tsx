import { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph3D from "react-force-graph-3d";
import SpriteText from "three-spritetext";
import type { GraphState, VisualLink, VisualNode } from "../domain/events";
import type { SelectedGraphItem } from "./InspectorPanel";

type MissionGraph3DProps = {
  graphState: GraphState;
  onSelect: (item: SelectedGraphItem | undefined) => void;
  edgeFilters?: { contains: boolean; imports: boolean };
  selected?: SelectedGraphItem;
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

function getNodeDisplayLabel(node: any): string {
  if (node.label) return node.label;
  if (node.metadata?.name) return node.metadata.name;
  if (node.metadata?.path) return node.metadata.path.split('/').pop() || node.id;
  return node.id;
}

export function MissionGraph3D({ graphState, onSelect, edgeFilters, selected }: MissionGraph3DProps) {
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dim, setDim] = useState({ w: 0, h: 0 });
  const [hoverNode, setHoverNode] = useState<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setDim({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const { enhancedNodes, links, highlightNodes, highlightLinks } = useMemo(() => {
    const nodes = graphState.nodes;
    const links = graphState.links;

    const degreeMap = new Map<string, number>();
    let rootId = "root";

    nodes.forEach(n => {
      if (n.metadata?.subtype === "project_root") rootId = n.id;
    });

    const topLevelFolders = new Set<string>();

    links.forEach(l => {
      const srcId = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const tgtId = typeof l.target === 'object' ? (l.target as any).id : l.target;

      degreeMap.set(srcId, (degreeMap.get(srcId) || 0) + 1);
      degreeMap.set(tgtId, (degreeMap.get(tgtId) || 0) + 1);
      
      if (srcId === rootId && l.type === "contains") {
        topLevelFolders.add(tgtId);
      }
    });

    const activeNode = selected?.type === "node" ? selected.value : hoverNode;
    const activeNodes = new Set<string>();
    const activeLinks = new Set<string>();

    if (activeNode) {
      activeNodes.add(activeNode.id);
      links.forEach(l => {
        const srcId = typeof l.source === 'object' ? (l.source as any).id : l.source;
        const tgtId = typeof l.target === 'object' ? (l.target as any).id : l.target;
        
        if (srcId === activeNode.id || tgtId === activeNode.id) {
          activeLinks.add((l as any).id || `${srcId}-${tgtId}-${l.type}`);
          activeNodes.add(srcId);
          activeNodes.add(tgtId);
        }
      });
    }

    const enhancedNodes = nodes.map(n => {
      const degree = degreeMap.get(n.id) || 0;
      let val = n.val;
      let isRoot = n.id === rootId;
      let isTop = topLevelFolders.has(n.id);
      
      let boost = Math.min(Math.log(1 + degree) * 2, 10);
      if (isRoot) boost += 8;
      else if (isTop) boost += 4;
      
      return {
        ...n,
        val: val + boost,
        isRoot,
        isTopLevel: isTop
      };
    });

    return { 
      enhancedNodes, 
      links, 
      highlightNodes: activeNode ? activeNodes : null, 
      highlightLinks: activeNode ? activeLinks : null 
    };
  }, [graphState.nodes, graphState.links, selected, hoverNode]);

  const graphData = useMemo(() => ({
    nodes: enhancedNodes,
    links: links
  }), [enhancedNodes, links]);

  useEffect(() => {
    if (!graphRef.current || enhancedNodes.length === 0) return;

    graphRef.current.d3Force("charge")?.strength(-180);
    graphRef.current.d3Force("link")?.distance((link: VisualLink) => {
      if (link.type === "contains") return 70;
      if (link.type === "proves") return 120;
      if (link.status === "conflict") return 160;
      return 100;
    });
  }, [enhancedNodes.length, links.length]);

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
          nodeVal={(node: any) => node.val}
          nodeColor={(node: any) => {
            if (highlightNodes) {
              return highlightNodes.has(node.id) ? node.color : 'rgba(100, 100, 100, 0.1)';
            }
            return node.color;
          }}
          nodeLabel={(node: any) => `${node.kind}: ${node.label}\n${node.status}`}
          onNodeHover={setHoverNode}
          nodeThreeObject={(node: any) => {
            const isSelected = selected?.type === "node" && selected.value.id === node.id;
            const isHovered = hoverNode && hoverNode.id === node.id;
            const showLabel = isSelected || isHovered || node.isRoot || node.isTopLevel || (enhancedNodes.length <= 50);
            
            if (!showLabel) return null;

            const label = getNodeDisplayLabel(node);
            const sprite = new SpriteText(label);
            sprite.color = isSelected ? '#ffffff' : '#e2e8f0';
            sprite.textHeight = isSelected ? 6 : (node.isRoot ? 8 : 4);
            sprite.backgroundColor = 'rgba(0,0,0,0.6)';
            sprite.padding = 2;
            sprite.borderRadius = 2;
            (sprite as any).position.y = 12;
            return sprite;
          }}
          nodeThreeObjectExtend={true}
          linkSource="source"
          linkTarget="target"
          linkColor={(link: any) => {
            if (highlightLinks) {
              const linkId = link.id || `${link.source.id || link.source}-${link.target.id || link.target}-${link.type}`;
              return highlightLinks.has(linkId) ? link.color : 'rgba(100, 100, 100, 0.05)';
            }
            return link.color;
          }}
          linkWidth={(link: VisualLink) => highlightLinks ? 0.5 : linkWidth(link)}
          linkVisibility={(link: VisualLink) => {
            if (edgeFilters) {
              if (link.type === "contains" && !edgeFilters.contains) return false;
              if (link.type === "imports" && !edgeFilters.imports) return false;
            }
            return true;
          }}
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          linkDirectionalParticles={(link: VisualLink) => linkParticles(link)}
          linkDirectionalParticleWidth={(link: VisualLink) => (link.status === "conflict" ? 4 : 2)}
          linkDirectionalParticleSpeed={(link: VisualLink) => (link.status === "conflict" ? 0.012 : 0.006)}
          onNodeClick={(node: any) => onSelect({ type: "node", value: node })}
          onBackgroundClick={() => onSelect(undefined)}
          onLinkClick={(link: any) => onSelect({ type: "edge", value: link })}
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
