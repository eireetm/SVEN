import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";
import type { HostConfig } from "./config.ts";

/** A saved replay in replays/, with what the list of replays shows of it. */
export interface ReplayFileEntry {
  file: string;
  /** When the file was last written (ms since 1970). */
  modified: number;
  /** The replay's own summary and players, when the file can be read. */
  deckNames: [string, string] | null;
  controllers: [string, string] | null;
  info: { savedAt?: string; result: unknown; turn: number } | null;
  inputs: number;
}

/** The full path of a replay file inside replays/, or null: no sub-folders, no "..", must end with ".json". */
export function replayPath(cfg: HostConfig, file: string): string | null {
  if (!/^[\p{L}\p{N} _.()\-]+\.json$/u.test(file) || file.startsWith(".")) return null;
  const root = resolve(cfg.replaysDir);
  const full = resolve(root, file);
  return full.startsWith(root + sep) ? full : null;
}

/** The saved replays, newest first. */
export function listReplays(cfg: HostConfig): ReplayFileEntry[] {
  if (!existsSync(cfg.replaysDir)) return [];
  const out: ReplayFileEntry[] = [];
  for (const file of readdirSync(cfg.replaysDir)) {
    if (file.startsWith(".") || !file.endsWith(".json")) continue;
    const full = resolve(cfg.replaysDir, file);
    const stat = statSync(full);
    if (!stat.isFile()) continue;
    out.push({ file, modified: stat.mtimeMs, ...summary(full) });
  }
  return out.sort((a, b) => b.modified - a.modified || a.file.localeCompare(b.file));
}

function summary(full: string): Pick<ReplayFileEntry, "deckNames" | "controllers" | "info" | "inputs"> {
  try {
    const json = JSON.parse(readFileSync(full, "utf8")) as {
      options?: { deckNames?: [string, string]; controllers?: [string, string] };
      info?: ReplayFileEntry["info"];
      inputs?: unknown[];
    };
    return {
      deckNames: json.options?.deckNames ?? null,
      controllers: json.options?.controllers ?? null,
      info: json.info ?? null,
      inputs: Array.isArray(json.inputs) ? json.inputs.length : 0,
    };
  } catch {
    return { deckNames: null, controllers: null, info: null, inputs: 0 };
  }
}

export function readReplayText(full: string): string {
  return readFileSync(full, "utf8");
}

export function writeReplayText(full: string, text: string): void {
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, text.endsWith("\n") ? text : text + "\n", "utf8");
}

/** Delete a replay file (the list's "delete", after the person confirmed it). */
export function deleteReplayFile(full: string): void {
  rmSync(full);
}
