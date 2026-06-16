type ControlPanelProps = {
  isPlaying: boolean;
  cursor: number;
  totalEvents: number;
  progress: number;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onReplay: () => void;
  onReset: () => void;
};

export function ControlPanel({
  isPlaying,
  cursor,
  totalEvents,
  progress,
  onPlay,
  onPause,
  onStep,
  onReplay,
  onReset,
}: ControlPanelProps) {
  return (
    <section className="panel control-panel">
      <div className="panel-header">
        <span className="eyebrow">Admission Guard replay</span>
        <strong>Mock run</strong>
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
    </section>
  );
}
