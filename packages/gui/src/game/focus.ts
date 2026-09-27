// Which card the card panel shows (the one under the pointer, else the one clicked last) and which cards the board
// highlights (while pointing at an action, a choice or a log line).
import { useSyncExternalStore } from "react";
import type { CardId, CardView } from "@sve/core";

export interface FocusCard {
  id?: CardId;
  /** The definition shown (an evolved card's while it is evolved, a back face's while it shows it). */
  def: string;
  printing: string | null;
  back?: boolean;
  /** The card as it is now, when it is visible in the game. */
  view?: CardView;
}

interface FocusState {
  hover: FocusCard | null;
  pinned: FocusCard | null;
  highlight: readonly CardId[];
}

let state: FocusState = { hover: null, pinned: null, highlight: [] };
const listeners = new Set<() => void>();

function set(change: Partial<FocusState>): void {
  state = { ...state, ...change };
  for (const listener of listeners) listener();
}

export const setHover = (card: FocusCard | null): void => set({ hover: card });
export const pinCard = (card: FocusCard | null): void => set({ pinned: card });
export const setHighlight = (ids: readonly CardId[]): void => set({ highlight: ids });

/** A part of the focus state (re-renders only when it changes; the selector must return a primitive or a stored value). */
export function useFocusSelect<T>(select: (s: FocusState) => T): T {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => select(state),
  );
}

export function useFocus(): FocusState {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
  );
}
