import { useState } from "react";
import { ControlPanel } from "./components/ControlPanel";
import { InspectorPanel, type SelectedGraphItem } from "./components/InspectorPanel";
import { MissionGraph3D } from "./components/MissionGraph3D";
import { StatsPanel } from "./components/StatsPanel";
import { useAdmissionReplay } from "./hooks/useAdmissionReplay";

export function App() {
  const replay = useAdmissionReplay();
  const [selected, setSelected] = useState<SelectedGraphItem>();

  return (
    <main className="app-shell">
      <aside className="side-panel left-panel">
        <section className="hero-card">
          <span className="eyebrow">Mission Control v1</span>
          <h1>Live 3D Semantic Graph</h1>
          <p>
            Prototype viewer for Admission Guard event streams. It replays semantic events, builds a canonical graph
            and projects it into a rotatable 3D scene.
          </p>
        </section>

        <ControlPanel
          isPlaying={replay.isPlaying}
          cursor={replay.cursor}
          totalEvents={replay.events.length}
          progress={replay.progress}
          onPlay={replay.play}
          onPause={replay.pause}
          onStep={replay.step}
          onReplay={replay.replay}
          onReset={() => {
            setSelected(undefined);
            replay.reset();
          }}
        />

        <StatsPanel graphState={replay.graphState} />

        <section className="panel legend-panel">
          <div className="panel-header">
            <span className="eyebrow">Projection layers</span>
            <strong>Z-axis</strong>
          </div>
          <ul className="legend-list">
            <li><span>+300</span> Admission verdict</li>
            <li><span>+200</span> Invariants / contracts</li>
            <li><span>+100</span> Functions / rules</li>
            <li><span>0</span> Modules / types</li>
            <li><span>-100</span> Effects / boundary</li>
            <li><span>-200</span> Conflicts / S-state</li>
          </ul>
        </section>
      </aside>

      <section className="stage-panel">
        <MissionGraph3D graphState={replay.graphState} onSelect={setSelected} />
      </section>

      <InspectorPanel selected={selected} events={replay.graphState.events} />
    </main>
  );
}
