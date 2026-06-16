import { parseJsonlEvents } from "./jsonl";
import { adaptAgOutputToEvents } from "./agAdapter";
import type { SemanticGraphEvent } from "./events";

export function importEvents(source: string): SemanticGraphEvent[] {
  const trimmed = source.trim();
  if (!trimmed) {
    return [];
  }

  // Auto-detect JSON vs JSONL
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsedObject = JSON.parse(trimmed);
      // If it's a single valid object, adapt it
      return adaptAgOutputToEvents(parsedObject);
    } catch (e) {
      // If JSON.parse fails, it might still be JSONL where the first line is valid JSON,
      // but let's fall back to parsing as JSONL.
      return parseJsonlEvents(source);
    }
  }

  // Default to JSONL parser
  return parseJsonlEvents(source);
}
