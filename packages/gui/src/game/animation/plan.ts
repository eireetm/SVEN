// Where each card of an update flies from and to (pure: tested in Node). A card gets a new id in each zone (CR 4.1.4), so
// a card is followed through the moves of one update by its ids: hand -> resolution -> field is one flight, from the hand
// to the field.
import type { CardId, PlayerId, ZoneRef } from "@sve/core";
import type { CardInfo, LogEntry } from "../../engine/protocol";

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

/** A card played in an update (CR 10.6.2.7), to show in its player's corner once it has landed (field, cemetery). */
export interface PlayedCard {
  /** Its id in the resolution zone (the cardPlayed event's card). */
  id: CardId;
  player: PlayerId;
  card: CardInfo;
}

/** The cards played in an update, but `skip` (a Quick card its announcement shows). */
export function playedCards(entries: readonly LogEntry[], skip: CardId | null = null): PlayedCard[] {
  return entries.flatMap(({ event, cards }) =>
    event.type === "cardPlayed" && event.card !== skip ? [{ id: event.card, player: event.player, card: cards[event.card] ?? { def: event.def, printing: null } }] : [],
  );
}

/** Cards an effect selected in public zones (CR 10.6.2.3, the cardsSelected events): an arrow from its source to each. */
export interface Selection {
  source: CardId;
  targets: CardId[];
}

/** The selections of an update, but those of `skip` (a Quick play its announcement shows with its own arrows). */
export function selectionsIn(entries: readonly LogEntry[], skip: CardId | null = null): Selection[] {
  return entries.flatMap(({ event }) =>
    event.type === "cardsSelected" && event.source !== null && event.source !== skip && event.cards.length > 0 ? [{ source: event.source, targets: event.cards }] : [],
  );
}

/**
 * Attacks declared and ended within one update (CR 8.4.5-8.4.11: nothing stopped them before their combat), whose arrows
 * are drawn with their combat; an attack still going on has its own arrow (board/AttackArrow.tsx).
 */
export function attacksIn(entries: readonly LogEntry[]): { attacker: CardId; target: CardId }[] {
  const declared = new Map<CardId, CardId>();
  const ended: { attacker: CardId; target: CardId }[] = [];
  for (const { event } of entries) {
    if (event.type === "attackDeclared") declared.set(event.attacker, event.target);
    else if (event.type === "attackEnded" && declared.has(event.attacker)) ended.push({ attacker: event.attacker, target: declared.get(event.attacker)! });
  }
  return ended;
}
