// Per-viewer settings, remembered in the browser (localStorage). Everything works without it (private windows, blocked
// storage): the defaults are used.
import { useSyncExternalStore } from "react";
import type { FormatId, SeatController, TurnOrder } from "../engine/protocol";
import type { TurnServer } from "../net/relays";

export type UiLang = "en" | "zh" | "ja";
export type CardLang = "en" | "cn" | "ja";

export interface Settings {
  uiLang: UiLang;
  cardLang: CardLang;
  /** The worker's pause before each bot answer. */
  botDelayMs: number;
  /** The sound effects' volume, 0–1 (sounds play only when the player provided them: public/audio, docs/resources.md). */
  volume: number;
  /** The background music's volume, 0–1. */
  bgmVolume: number;
  /** The table's animations (cards flying, numbers, ...). */
  animations: boolean;
  /** The last game setup (deck files, who plays each seat). */
  setupDecks: [string, string];
  setupControllers: [SeatController, SeatController];
  /** Who goes first in the games started from the setup (advanced). */
  setupTurnOrder: TurnOrder;
  /** The format decks are built and games are played in (the deck builder and the game setup share it). */
  format: FormatId;
  /** The restriction list chosen for each format (a file of restrictions/, or none). */
  restrictionLists: Partial<Record<FormatId, string | null>>;
  /** The deck file the deck builder edited last. */
  builderDeck: string | null;
  /** The deck builder's pool lists every printing (alternate arts) instead of one per card. */
  builderAllPrintings: boolean;
  /** How see-through the interface is, 0–0.6 (null: the style's own, public/theme.css or the built-in one). */
  uiTransparency: number | null;
  /** A person picks the mat slot of each card they put on the field or into the EX area (the look only). */
  manualSlots: boolean;
  /** Manual debugging: clicks on cards, decks, leaders and point panels open what can be done by hand (docs/gui.md). */
  manualDebug: boolean;
  /** After each Quick card or ability, the game waits until the person has seen it (who played what, its targets). */
  announceQuick: boolean;
  /** Online play: the player's own TURN relay, for networks that can't connect directly (empty urls: none; docs/online.md). */
  turn: TurnServer;
}

const KEY = "sve-gui-settings";
const DEFAULTS: Settings = {
  uiLang: "en",
  cardLang: "en",
  botDelayMs: 600,
  volume: 0.6,
  bgmVolume: 0.4,
  animations: true,
  setupDecks: ["samples/sd01.json", "samples/sd02.json"],
  setupControllers: ["human", "greedy"],
  setupTurnOrder: "choose",
  format: "standard",
  restrictionLists: {},
  builderDeck: null,
  builderAllPrintings: false,
  uiTransparency: null,
  manualSlots: false,
  manualDebug: false,
  announceQuick: true,
  turn: { urls: "", username: "", credential: "" },
};

/** Settings saved by an older version, brought up to date: "deck restrictions" off became the unlimited format. */
export function migrateSettings(saved: Partial<Settings> & { setupRestrictions?: boolean }): Settings {
  const { setupRestrictions, ...rest } = saved;
  return { ...DEFAULTS, ...(setupRestrictions === false && rest.format === undefined ? { format: "unlimited" as const } : {}), ...rest };
}

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? migrateSettings(JSON.parse(raw) as Partial<Settings>) : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

let settings = load();
const listeners = new Set<() => void>();

export function getSettings(): Settings {
  return settings;
}

export function updateSettings(change: Partial<Settings>): void {
  settings = { ...settings, ...change };
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // Not remembered: fine.
  }
  for (const listener of listeners) listener();
}

/** Follow the settings outside React (the music's volume). */
export function subscribeSettings(fn: (settings: Settings) => void): () => void {
  const listener = () => fn(settings);
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSettings(): Settings {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => settings,
  );
}
