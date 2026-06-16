import type { SemanticGraphEvent } from "./events";

// Basic types for File System Access API to avoid tsconfig dependency issues
export interface FileSystemHandle {
  kind: "file" | "directory";
  name: string;
}

export interface FileSystemFileHandle extends FileSystemHandle {
  kind: "file";
  getFile(): Promise<File>;
}

export interface FileSystemDirectoryHandle extends FileSystemHandle {
  kind: "directory";
  values(): AsyncIterableIterator<FileSystemHandle>;
}

const IGNORED_DIRS = new Set([
  "node_modules",
  "dist",
  "build",
  ".git",
  "coverage",
  ".vite",
  "target",
  ".cache",
  ".next",
  "out",
]);

const MAX_FILES = 500;
const MAX_NODES = 1000;
const MAX_EDGES = 2000;
const MAX_FILE_SIZE = 512 * 1024;

type FileScanResult = {
  path: string;
  name: string;
  isDir: boolean;
  parentPath: string | null;
  text?: string;
};

// Extremely basic resolution for relative imports. 
// E.g. source: "src/domain/events.ts", importPath: "./jsonl" -> "src/domain/jsonl"
function resolveRelativeImport(sourceFile: string, importPath: string): string {
  if (!importPath.startsWith(".")) return importPath;

  const sourceDir = sourceFile.includes("/") ? sourceFile.substring(0, sourceFile.lastIndexOf("/")) : "";
  const parts = sourceDir ? sourceDir.split("/") : [];

  const importParts = importPath.split("/");
  for (const part of importParts) {
    if (part === ".") continue;
    if (part === "..") {
      parts.pop();
    } else {
      parts.push(part);
    }
  }

  return parts.join("/");
}

export async function scanProject(dirHandle: FileSystemDirectoryHandle): Promise<SemanticGraphEvent[]> {
  const events: SemanticGraphEvent[] = [];
  const run_id = `scan-${Date.now()}`;
  const warnings: string[] = [];

  events.push({
    event: "run.started",
    run_id,
    timestamp: new Date().toISOString(),
    metadata: {
      scanner: "P0.5 Analyze Project Structural Scanner",
    },
  });

  let fileCount = 0;
  let nodeCount = 0;
  let edgeCount = 0;
  let truncated = false;

  const allFiles: FileScanResult[] = [];
  const validExtensions = [".ts", ".tsx", ".js", ".jsx"];

  async function walk(handle: FileSystemDirectoryHandle, currentPath: string, parentPath: string | null) {
    if (truncated) return;

    if (currentPath !== "") {
      allFiles.push({ path: currentPath, name: handle.name, isDir: true, parentPath });
      nodeCount++;
    }

    try {
      for await (const entry of handle.values()) {
        if (truncated) break;

        const entryPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;

        if (entry.kind === "directory") {
          if (IGNORED_DIRS.has(entry.name)) continue;
          await walk(entry as FileSystemDirectoryHandle, entryPath, currentPath);
        } else if (entry.kind === "file") {
          if (fileCount >= MAX_FILES || nodeCount >= MAX_NODES) {
            truncated = true;
            warnings.push("Max nodes/files limit reached. Scan truncated.");
            break;
          }

          const fileHandle = entry as FileSystemFileHandle;
          const isSourceFile = validExtensions.some((ext) => entry.name.endsWith(ext));
          
          if (isSourceFile) {
            fileCount++;
            nodeCount++;
            
            let text: string | undefined;
            try {
              const file = await fileHandle.getFile();
              if (file.size <= MAX_FILE_SIZE) {
                text = await file.text();
              } else {
                warnings.push(`File too large, skipped content: ${entryPath}`);
              }
            } catch (e) {
              warnings.push(`Could not read file: ${entryPath}`);
            }

            allFiles.push({
              path: entryPath,
              name: entry.name,
              isDir: false,
              parentPath: currentPath,
              text,
            });
          }
        }
      }
    } catch (err) {
      warnings.push(`Error reading directory ${currentPath || "root"}: ${(err as Error).message}`);
    }
  }

  // 1. Walk the file system
  await walk(dirHandle, "", null);

  // 2. Emit root node
  const rootId = `root`;
  events.push({
    event: "node.added",
    run_id,
    timestamp: new Date().toISOString(),
    node: {
      id: rootId,
      kind: "module",
      label: dirHandle.name,
      status: "verified",
      metadata: { subtype: "root_folder" },
    },
  });

  // 3. Emit nodes and containment edges
  const fileIds = new Set<string>();

  for (const item of allFiles) {
    fileIds.add(item.path);

    events.push({
      event: "node.added",
      run_id,
      timestamp: new Date().toISOString(),
      node: {
        id: item.path,
        kind: "module",
        label: item.name,
        status: "verified",
        metadata: { subtype: item.isDir ? "folder" : "source_file" },
      },
    });

    if (edgeCount < MAX_EDGES) {
      events.push({
        event: "edge.added",
        run_id,
        timestamp: new Date().toISOString(),
        edge: {
          id: `contains-${item.parentPath || rootId}-${item.path}`,
          source: item.parentPath || rootId,
          target: item.path,
          type: "contains",
        },
      });
      edgeCount++;
    }
  }

  // 4. Parse imports and emit import edges
  const importRegex = /(?:import\s+.*?from\s+|import\s*\(?\s*|require\s*\(\s*)['"]([^'"]+)['"]/g;

  for (const item of allFiles) {
    if (item.isDir || !item.text) continue;

    const matches = [...item.text.matchAll(importRegex)];
    for (const match of matches) {
      if (edgeCount >= MAX_EDGES) {
        if (!truncated) {
          truncated = true;
          warnings.push("Max edges limit reached. Imports truncated.");
        }
        break;
      }

      const importRaw = match[1];
      if (!importRaw) continue;

      const resolvedBase = resolveRelativeImport(item.path, importRaw);
      
      // Heuristic: check if exact match, or + .ts, .tsx, /index.ts etc exists in our fileIds set
      let targetId: string | null = null;
      const candidates = [
        resolvedBase,
        `${resolvedBase}.ts`,
        `${resolvedBase}.tsx`,
        `${resolvedBase}.js`,
        `${resolvedBase}.jsx`,
        `${resolvedBase}/index.ts`,
        `${resolvedBase}/index.tsx`,
      ];

      for (const cand of candidates) {
        if (fileIds.has(cand)) {
          targetId = cand;
          break;
        }
      }

      // We only emit edges to known files in our graph. Unresolved go to /dev/null
      if (targetId) {
        events.push({
          event: "edge.added",
          run_id,
          timestamp: new Date().toISOString(),
          edge: {
            id: `imports-${item.path}-${targetId}`,
            source: item.path,
            target: targetId,
            type: "imports",
          },
        });
        edgeCount++;
      }
    }
  }

  // 5. run.completed (no verdict!)
  events.push({
    event: "run.completed",
    run_id,
    timestamp: new Date().toISOString(),
    metadata: {
      warnings: warnings.length > 0 ? warnings : undefined,
    },
  });

  return events;
}
