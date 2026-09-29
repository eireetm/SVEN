// Replay files (docs/gui.md "录像"): what one must be, and the name one is saved under. No browser API here (tests run it).
import type { Replay } from "../engine/protocol";

/** A replay read from JSON (checked only for its shape; the engine checks every input). */
export function parseReplay(json: unknown): Replay {
  const value = json as Partial<Replay> | null;
  if (!value || value.format !== "sve-replay" || value.version !== 1 || !value.options || !Array.isArray(value.inputs)) {
    throw new Error('expected {"format": "sve-replay", "version": 1, ...}');
  }
  return value as Replay;
}

/** A file name for a replay saved now: "2026-09-29_210307_SD01_vs_SD02.json" (the characters host/replays.ts allows). */
export function replayFileName(replay: Replay, when: Date): string {
  const two = (n: number) => String(n).padStart(2, "0");
  const date = `${when.getFullYear()}-${two(when.getMonth() + 1)}-${two(when.getDate())}_${two(when.getHours())}${two(when.getMinutes())}${two(when.getSeconds())}`;
  const deck = (name: string) => name.replace(/[^\p{L}\p{N} _\-]/gu, "").trim().replace(/\s+/g, "_").slice(0, 32) || "deck";
  return `${date}_${deck(replay.options.deckNames[0])}_vs_${deck(replay.options.deckNames[1])}.json`;
}
