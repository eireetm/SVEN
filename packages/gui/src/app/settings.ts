// Per-viewer settings, remembered in the browser (localStorage). Everything works without it (private windows, blocked
// storage): the defaults are used.
import { useSyncExternalStore } from "react";
import type { SeatController } from "../engine/protocol";

export type UiLang = "en" | "zh";
export type CardLang = "en" | "cn" | "ja";

export interface Settings {
  uiLang: UiLang;
  cardLang: CardLang;
  /** The worker's pause before each bot answer. */
  botDelayMs: number;
  /** 0–1; sounds play only when the player provided them (public/audio). */
  volume: number;
  /** The table's animations (cards flying, numbers, ...). */
  animations: boolean;
  /** The last game setup (deck files, who plays each seat, deck restrictions). */
  setupDecks: [string, string];
  setupControllers: [SeatController, SeatController];
  setupRestrictions: boolean;
  /** The deck file the deck builder edited last. */
  builderDeck: string | null;
  /** The deck builder's pool lists every printing (alternate arts) instead of one per card. */
  builderAllPrintings: boolean;
  /** How see-through the interface is, 0–0.6 (null: the style's own, public/theme.css or the built-in one). */
  uiTransparency: number | null;
  /** A person picks the mat slot of each card they put on the field or into the EX area (the look only). */
  manualSlots: boolean;
}

const KEY = "sve-gui-settings";
const DEFAULTS: Settings = {
  uiLang: "en",
  cardLang: "en",
  botDelayMs: 600,
  volume: 0.6,
  animations: true,
  setupDecks: ["samples/sd01.json", "samples/sd02.json"],
  setupControllers: ["human", "greedy"],
  setupRestrictions: true,
  builderDeck: null,
  builderAllPrintings: false,
  uiTransparency: null,
  manualSlots: false,
};

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) } : DEFAULTS;
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

export function useSettings(): Settings {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => settings,
  );
}
