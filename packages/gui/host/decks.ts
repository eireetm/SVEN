import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import type { HostConfig } from "./config.ts";

/** A deck file in decks/ ("samples/sd01-forestcraft.json") with the name written in it. */
export interface DeckFileEntry {
  file: string;
  name: string;
}

/** The full path of a deck file inside decks/, or null: sub-folders allowed, no "..", must end with ".json". */
export function deckPath(cfg: HostConfig, file: string): string | null {
  if (!/^[\p{L}\p{N} _.()\-/]+\.json$/u.test(file)) return null;
  if (file.split("/").some((part) => part === "" || part === "." || part === "..")) return null;
  const root = resolve(cfg.decksDir);
  const full = resolve(root, file);
  return full.startsWith(root + sep) ? full : null;
}

export function listDecks(cfg: HostConfig): DeckFileEntry[] {
  const out: DeckFileEntry[] = [];
  const walk = (dir: string): void => {
    for (const name of readdirSync(dir)) {
      if (name.startsWith(".")) continue;
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (name.endsWith(".json")) {
        const file = relative(cfg.decksDir, full).split(sep).join("/");
        out.push({ file, name: deckName(full) ?? file });
      }
    }
  };
  if (existsSync(cfg.decksDir)) walk(cfg.decksDir);
  return out.sort((a, b) => a.file.localeCompare(b.file));
}

function deckName(full: string): string | null {
  try {
    const json: unknown = JSON.parse(readFileSync(full, "utf8"));
    const name = (json as { name?: unknown }).name;
    return typeof name === "string" && name !== "" ? name : null;
  } catch {
    return null;
  }
}

export function readDeckText(full: string): string {
  return readFileSync(full, "utf8");
}

/** Delete a deck file (the deck builder's "delete", after the person confirmed it). */
export function deleteDeckFile(full: string): void {
  rmSync(full);
}

export function writeDeckText(full: string, text: string): void {
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, text.endsWith("\n") ? text : text + "\n", "utf8");
}
