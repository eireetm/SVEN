// Which drawn slot of the mat each card on the field and in the EX area takes. The rules have no slots, only how many cards
// a zone holds (CR 4.4.4, 4.8.3): this is the table's look, kept here, not in the core. A card keeps its slot while it
// stays in its zone (a card that moves is a new card, CR 4.1.4); a new card takes its owner's first free slot from the left.
// With "choose card spots by hand" (the debug page) a person's new cards wait in that slot, marked, until they click the
// slot they want.
import type { CardId, PlayerId, PlayerView } from "@sve/core";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import type { GameUpdate } from "../../engine/protocol";
import { useSettings } from "../../app/settings";
import { SLOT_COUNT, type SlotZone } from "./layout";

export type SlotRow = readonly (CardId | null)[];

export interface Slots {
  /** Per player and zone ("0:field"), the card in each slot. */
  rows: Readonly<Record<string, SlotRow>>;
  /** Cards waiting for the person to pick their slot, the first one asked first. */
  waiting: readonly CardId[];
}

export const NO_SLOTS: Slots = { rows: {}, waiting: [] };
const ZONES: readonly SlotZone[] = ["field", "ex"];

export const rowKey = (player: PlayerId, zone: SlotZone): string => `${player}:${zone}`;

/** A row no card has been in yet. */
export const EMPTY_ROW: SlotRow = Array<CardId | null>(SLOT_COUNT).fill(null);

/**
 * The slots after an update: the cards that are gone free their slots, new ones take the first free slot (and wait for a
 * pick when their side is placed by hand). Cards beyond the slots get none (the table then lines the whole row up).
 * Returns `prev` itself when nothing changed.
 */
export function reconcileSlots(prev: Slots, view: PlayerView, byHand: (player: PlayerId) => boolean): Slots {
  const rows: Record<string, SlotRow> = { ...prev.rows };
  let changed = false;
  const onTable = new Set<CardId>();
  const newlyWaiting: CardId[] = [];
  for (const side of view.players) {
    for (const zone of ZONES) {
      const key = rowKey(side.id, zone);
      const ids = side[zone].map((c) => c.id);
      for (const id of ids) onTable.add(id);
      const old = prev.rows[key] ?? EMPTY_ROW;
      const row = old.map((id) => (id !== null && ids.includes(id) ? id : null));
      for (const id of ids) {
        if (row.includes(id)) continue;
        const free = row.indexOf(null);
        if (free < 0) continue;
        row[free] = id;
        if (byHand(side.id)) newlyWaiting.push(id);
      }
      if (row.some((id, i) => id !== old[i])) {
        rows[key] = row;
        changed = true;
      }
    }
  }
  // Still on the table, and still placed by hand.
  const sideOf = (id: CardId): PlayerId | undefined => view.players.find((s) => [...s.field, ...s.ex].some((c) => c.id === id))?.id;
  const waiting = [...prev.waiting.filter((id) => onTable.has(id) && byHand(sideOf(id)!)), ...newlyWaiting];
  const waitingChanged = waiting.length !== prev.waiting.length || waiting.some((id, i) => id !== prev.waiting[i]);
  return changed || waitingChanged ? { rows, waiting } : prev;
}

/** Where a card is: its row's key and slot, or null. */
export function slotOf(slots: Slots, card: CardId): { key: string; index: number } | null {
  for (const [key, row] of Object.entries(slots.rows)) {
    const index = row.indexOf(card);
    if (index >= 0) return { key, index };
  }
  return null;
}

/** The person picks slot `index` of the first waiting card's row: a free slot, or the one it waits in. */
export function placeWaiting(slots: Slots, index: number): Slots {
  const card = slots.waiting[0];
  if (card === undefined) return slots;
  const at = slotOf(slots, card);
  if (!at) return { ...slots, waiting: slots.waiting.slice(1) };
  const row = [...slots.rows[at.key]!];
  if (row[index] !== null && row[index] !== card) return slots;
  row[at.index] = null;
  row[index] = card;
  return { rows: { ...slots.rows, [at.key]: row }, waiting: slots.waiting.slice(1) };
}

// The slots last shown, kept between updates; a pick changes them.
let committed: Slots = NO_SLOTS;
const listeners = new Set<() => void>();

function commit(next: Slots): void {
  if (next === committed) return;
  committed = next;
  for (const listener of listeners) listener();
}

/** The person picks slot `index` for the card waiting first. */
export function chooseSlot(index: number): void {
  commit(placeWaiting(committed, index));
}

/**
 * The slots for this update. Worked out while rendering from the slots last shown (so a card never shows without one) and
 * kept once shown.
 */
export function useSlots(update: GameUpdate): Slots {
  const base = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => committed,
  );
  const { manualSlots } = useSettings();
  const next = useMemo(() => reconcileSlots(base, update.view, (player) => manualSlots && update.controllers[player] === "human"), [base, update, manualSlots]);
  useEffect(() => commit(next), [next]);
  return next;
}
