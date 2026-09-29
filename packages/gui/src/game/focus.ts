// Which card the card panel shows (the last one the pointer went over: it stays until the pointer goes over another card)
// and which cards the board highlights (while pointing at an action, a choice or a log line).
import { useSyncExternalStore } from "react";
import type { CardId, CardView } from "@sve/core";

export interface FocusCard {
  id?: CardId;
  /** The definition shown (an evolved card's while it is evolved, a back face's while it shows it). */
  def: string;
  printing: string | null;
  back?: boolean;
  /** The card as it was when shown, when it is visible in the game (the panel follows it while it stays in its zone). */
  view?: CardView;
}

interface FocusState {
  shown: FocusCard | null;
  highlight: readonly CardId[];
}

let state: FocusState = { shown: null, highlight: [] };
const listeners = new Set<() => void>();

function set(change: Partial<FocusState>): void {
  state = { ...state, ...change };
  for (const listener of listeners) listener();
}

/** Show a card in the card panel (the pointer went over it). */
export const showCard = (card: FocusCard): void => set({ shown: card });
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
