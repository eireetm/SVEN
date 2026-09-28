// What the person is doing on the table for the pending decision: an open card menu, a drag, the cards chosen so far, an
// answer on its way. All of it belongs to one decision (the update's input count) and is dropped when the next one comes.
// The options themselves always come from the decision (the GUI works out no rules).
import { useSyncExternalStore } from "react";
import type { Answer, CardId } from "@sve/core";
import { engine } from "../app/store";
import type { GameUpdate } from "../engine/protocol";
import { setHighlight } from "./focus";

export { actionsFor, answerFor, attackTargets, dragKind, type TableAction } from "./actions";

export interface CardMenu {
  card: CardId;
  /** Where to show it: the card's box on the screen. */
  anchor: { left: number; top: number; right: number; bottom: number };
}

export interface Drag {
  card: CardId;
  kind: "play" | "attack";
  x: number;
  y: number;
  /** What is under the pointer and would take the drop: a target card, or "field" for a play. */
  over: CardId | "field" | null;
}

interface InteractionState {
  /** The decision (update.inputCount) this state is for. */
  key: number;
  menu: CardMenu | null;
  drag: Drag | null;
  /** Cards chosen so far for a "select cards" decision. */
  chosen: CardId[];
  /** An answer was sent for this decision and the reply hasn't come. */
  sent: boolean;
}

let state: InteractionState = { key: -1, menu: null, drag: null, chosen: [], sent: false };
const listeners = new Set<() => void>();

function set(change: Partial<InteractionState>): void {
  state = { ...state, ...change };
  for (const listener of listeners) listener();
}

/** Start afresh for a new decision (called when an update arrives). */
export function resetInteraction(key: number): void {
  if (state.key !== key) set({ key, menu: null, drag: null, chosen: [], sent: false });
}

/** A refused answer brings an error, not an update: the controls work again. */
export function answerRefused(): void {
  if (state.sent) set({ sent: false });
}

export const openMenu = (menu: CardMenu | null): void => set({ menu, drag: null });
export const setDrag = (drag: Drag | null): void => set({ drag });

export function toggleChosen(card: CardId, max: number): void {
  const chosen = state.chosen.includes(card) ? state.chosen.filter((c) => c !== card) : max === 1 ? [card] : state.chosen.length < max ? [...state.chosen, card] : state.chosen;
  set({ chosen });
}

export function useInteraction<T>(select: (s: InteractionState) => T): T {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => select(state),
  );
}

/** Send the person's answer to the pending decision (once; the controls wait for the reply). */
export function sendAnswer(update: GameUpdate, answer: Answer): void {
  const info = update.decision;
  if (!info || state.sent || state.key !== update.inputCount) return;
  set({ sent: true, menu: null, drag: null });
  setHighlight([]);
  engine.send({ kind: "answer", seat: info.decision.player, answer });
}

// Each update may bring a new decision; an error after an answer is the answer being refused.
engine.subscribe((message) => {
  if (message.kind === "update") resetInteraction(message.update.inputCount);
  else if (message.kind === "error") answerRefused();
});
