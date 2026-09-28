// Where each card of an update flies from and to (pure: tested in Node). A card gets a new id in each zone (CR 4.1.4), so
// a card is followed through the moves of one update by its ids: hand -> resolution -> field is one flight, from the hand
// to the field.
import type { CardId, ZoneRef } from "@sve/core";
import type { LogEntry } from "../../engine/protocol";

/** Where a flight starts: the card's old element if it was shown, else its zone's place (a pile, a hand). */
export interface Origin {
  card: CardId | null;
  zone: string | null;
}

export interface Flight {
  origin: Origin;
  /** The zone it ends in ("0:field", "resolution", ...). */
  to: string | null;
  /** Its id there; null when it went into a deck (hidden, CR 4.1.2: no id is given). */
  card: CardId | null;
}

/** The key of a zone on the table: "player:zone", or "resolution" (shared by both players, CR 4.11). */
export const zoneKey = (ref: ZoneRef | null): string | null => (ref === null ? null : ref.zone === "resolution" ? "resolution" : `${ref.player}:${ref.zone}`);

/** The flights of an update's card moves: one per card, from where it was before the update to where it is now. */
export function planFlights(entries: readonly LogEntry[]): Flight[] {
  const origins = new Map<CardId, Origin>();
  const arrived = new Map<CardId, Flight>();
  const hidden: Flight[] = [];
  for (const { event } of entries) {
    if (event.type !== "cardsMoved") continue;
    for (const move of event.moves) {
      const origin = (move.card ? origins.get(move.card) : undefined) ?? { card: move.card, zone: zoneKey(move.from) };
      if (move.card) arrived.delete(move.card);
      const flight: Flight = { origin, to: zoneKey(move.to), card: move.newCard };
      if (move.newCard) {
        origins.set(move.newCard, origin);
        arrived.set(move.newCard, flight);
      } else hidden.push(flight);
    }
  }
  return [...arrived.values(), ...hidden];
}
