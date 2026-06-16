import { useRef } from "react";
import { importEvents } from "../domain/eventInput";
import { scanProject, type FileSystemDirectoryHandle } from "../domain/projectScanner";
import type { SemanticGraphEvent } from "../domain/events";

type ControlPanelProps = {
  isPlaying: boolean;
  cursor: number;
  totalEvents: number;
  progress: number;
  sourceLabel?: string;
  error?: string | null;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onReplay: () => void;
  onReset: () => void;
  onLoadEvents?: (events: SemanticGraphEvent[], filename: string) => void;
  onError?: (err: string) => void;
  edgeFilters?: { contains: boolean; imports: boolean };
  onEdgeFiltersChange?: (filters: { contains: boolean; imports: boolean }) => void;
};

export function ControlPanel({
  isPlaying,
  cursor,
  totalEvents,
  progress,
  sourceLabel,
  error,
  onPlay,
  onPause,
  onStep,
  onReplay,
  onReset,
  onLoadEvents,
  onError,
  edgeFilters,
  onEdgeFiltersChange,
}: ControlPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onLoadEvents || !onError) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const parsed = importEvents(text);
        onLoadEvents(parsed, file.name);
        
        // Reset the input so the same file can be loaded again if needed
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (err) {
        onError((err as Error).message);
      }
    };
    reader.onerror = () => {
      onError("Failed to read file.");
    };
    reader.readAsText(file);
  };

  const handleAnalyzeProject = async () => {
    if (!("showDirectoryPicker" in window)) {
      if (onError) onError("Analyze Project requires Chrome / Edge File System Access API.");
      return;
    }

    try {
      // @ts-ignore
      const dirHandle = await window.showDirectoryPicker() as FileSystemDirectoryHandle;
      if (!onLoadEvents) return;
      
      const events = await scanProject(dirHandle);
      onLoadEvents(events, `Analyze: ${dirHandle.name}`);
    } catch (err: any) {
      if (err.name !== "AbortError" && onError) {
        onError(`Scan failed: ${err.message}`);
      }
    }
  };

  return (
    <section className="panel control-panel">
      <div className="panel-header">
        <span className="eyebrow">Admission Guard replay</span>
        <strong>{sourceLabel || "Mock run"}</strong>
      </div>

      <div className="file-import" style={{ marginBottom: "14px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <button type="button" style={{ flex: 1 }} onClick={() => fileInputRef.current?.click()}>
            Load JSONL
          </button>
          <button type="button" style={{ flex: 1 }} onClick={handleAnalyzeProject}>
            Analyze Project
          </button>
        </div>
        <input 
          type="file" 
          accept=".json,.jsonl" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          style={{ display: "none" }} 
        />
        {error && <div className="error-message" style={{ color: "#ef4444", marginTop: "8px", fontSize: "13px", textAlign: "center" }}>{error}</div>}
      </div>

      <div className="progress-shell" aria-label="Replay progress">
        <div className="progress-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>

      <div className="control-row">
        <button type="button" onClick={isPlaying ? onPause : onPlay}>
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button type="button" onClick={onStep} disabled={cursor >= totalEvents}>
          Step
        </button>
        <button type="button" onClick={onReplay}>
          Replay
        </button>
        <button type="button" onClick={onReset}>
          Reset
        </button>
      </div>

      <div className="meta-grid">
        <span>Events</span>
        <strong>
          {cursor} / {totalEvents}
        </strong>
      </div>

      {edgeFilters && onEdgeFiltersChange && (
        <div className="edge-filters" style={{ marginTop: "14px", display: "flex", gap: "12px", fontSize: "13px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <input 
              type="checkbox" 
              checked={edgeFilters.contains} 
              onChange={(e) => onEdgeFiltersChange({ ...edgeFilters, contains: e.target.checked })} 
            />
            Contains
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <input 
              type="checkbox" 
              checked={edgeFilters.imports} 
              onChange={(e) => onEdgeFiltersChange({ ...edgeFilters, imports: e.target.checked })} 
            />
            Imports
          </label>
        </div>
      )}
    </section>
  );
}
