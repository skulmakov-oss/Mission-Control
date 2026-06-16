import type { SemanticGraphEvent } from "./events";

export function parseJsonlEvents(source: string): SemanticGraphEvent[] {
  return source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line) as SemanticGraphEvent;
      } catch (error) {
        throw new Error(`Invalid JSONL event at line ${index + 1}: ${(error as Error).message}`);
      }
    });
}
