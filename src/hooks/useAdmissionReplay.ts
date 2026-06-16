import { useCallback, useEffect, useMemo, useState } from "react";
import mockAdmissionRun from "../../examples/mock-admission-run.jsonl?raw";
import { applyGraphEvent, emptyGraphState } from "../domain/graphReducer";
import { parseJsonlEvents } from "../domain/jsonl";
import type { GraphState, SemanticGraphEvent } from "../domain/events";

const PLAYBACK_INTERVAL_MS = 650;

export function useAdmissionReplay() {
  const events = useMemo(() => parseJsonlEvents(mockAdmissionRun), []);
  const [cursor, setCursor] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [graphState, setGraphState] = useState<GraphState>(emptyGraphState);

  const step = useCallback(() => {
    setCursor((currentCursor) => {
      if (currentCursor >= events.length) {
        setIsPlaying(false);
        return currentCursor;
      }

      const event = events[currentCursor];
      setGraphState((currentState) => applyGraphEvent(currentState, event));
      return currentCursor + 1;
    });
  }, [events]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCursor(0);
    setGraphState(emptyGraphState);
  }, []);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const replay = useCallback(() => {
    setGraphState(emptyGraphState);
    setCursor(0);
    setIsPlaying(true);
  }, []);

  useEffect(() => {
    if (!isPlaying) return undefined;

    if (cursor >= events.length) {
      setIsPlaying(false);
      return undefined;
    }

    const timer = window.setTimeout(step, PLAYBACK_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [cursor, events.length, isPlaying, step]);

  return {
    events: events as SemanticGraphEvent[],
    graphState,
    cursor,
    isPlaying,
    progress: events.length === 0 ? 0 : cursor / events.length,
    play,
    pause,
    replay,
    reset,
    step,
  };
}
