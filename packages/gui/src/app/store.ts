// The app's state: what the engine worker published (catalog, the game's latest update, the log) and the errors to show.
// Components read it with useApp(select); only the worker's messages change it.
import { useSyncExternalStore } from "react";
import { EngineClient } from "../engine/client";
import type { GameUpdate, LogEntry } from "../engine/protocol";
import { playEventSounds } from "../resources/sound";
import { Catalog } from "./catalog";

export interface AppError {
  id: number;
  message: string;
}

export interface AppState {
  ready: boolean;
  /** The engine failed to start. */
  startError: string | null;
  catalog: Catalog | null;
  update: GameUpdate | null;
  log: LogEntry[];
  errors: AppError[];
}

let state: AppState = { ready: false, startError: null, catalog: null, update: null, log: [], errors: [] };
const listeners = new Set<() => void>();

function setState(change: Partial<AppState>): void {
  state = { ...state, ...change };
  for (const listener of listeners) listener();
}

/** The engine worker (one for the whole app). */
export const engine = new EngineClient();

let nextError = 1;

const beforeUpdate = new Set<(update: GameUpdate) => void>();

/** Run `fn` with each update just before it is shown (the table's animations note where the cards were). */
export function onBeforeUpdate(fn: (update: GameUpdate) => void): () => void {
  beforeUpdate.add(fn);
  return () => beforeUpdate.delete(fn);
}

engine.subscribe((message) => {
  switch (message.kind) {
    case "ready":
      setState({ ready: true, catalog: new Catalog(message.catalog) });
      break;
    case "update": {
      const update = message.update;
      for (const fn of beforeUpdate) fn(update);
      if (!update.logReset) playEventSounds(update.log, update.perspective);
      setState({ update, log: update.logReset ? update.log : [...state.log, ...update.log] });
      break;
    }
    case "error":
      setState({
        ...(state.ready ? {} : { startError: message.message }),
        errors: [...state.errors, { id: nextError++, message: message.message }].slice(-8),
      });
      break;
    default:
      break;
  }
});

export function reportError(message: string): void {
  setState({ errors: [...state.errors, { id: nextError++, message }].slice(-8) });
}

export function dismissError(id: number): void {
  setState({ errors: state.errors.filter((e) => e.id !== id) });
}

/** Read part of the state; the selector must return a value from the state (not a new object), or React re-renders forever. */
export function useApp<T>(select: (s: AppState) => T): T {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => select(state),
  );
}
