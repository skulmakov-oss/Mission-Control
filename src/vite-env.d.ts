/// <reference types="vite/client" />

declare module "*.jsonl?raw" {
  const content: string;
  export default content;
}

declare module "react-force-graph-3d" {
  const ForceGraph3D: any;
  export default ForceGraph3D;
}
