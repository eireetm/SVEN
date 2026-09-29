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

/** When the parts of an update's animation happen (ms after it is shown); the sounds keep to the same times. */
export const TIMING = {
  /** The flights (380 ms) have about landed: a played card shows in its corner. */
  landed: 320,
  /** A played card's wipe in, its stay and its wipe out. */
  showcase: 900,
  /** The arrows of a played card, once it has wiped in. */
  fromCorner: 490,
  /** The arrows of a card on the table. */
  fromTable: 120,
  /** How long an arrow is shown. */
  arrow: 700,
  /** An attack whose arrow is drawn now lunges after it. */
  lunge: 220,
  /** The damage of an attack shows as the lunge strikes; an effect's, this long after its arrow. */
  strike: 170,
  /** A card that was hit and has gone waits this long before it flies away. */
  leave: 330,
} as const;

/** The order of an update's animation (animation/AnimationLayer.tsx), and when its cards are hit (the sounds too). */
export interface Timeline {
  /** Played cards and when each shows in its corner, one after another. */
  played: (PlayedCard & { at: number })[];
  /** Attacks nothing stopped before their combat: their arrows at once. */
  attacks: { attacker: CardId; target: CardId }[];
  /** Attackers lunging at their targets (CR 8.4.9). */
  lunges: { attacker: CardId; target: CardId; at: number }[];
  /** Arrows from an effect's source to each card it selected; `corner`: from the played card's corner. */
  selections: { source: CardId; target: CardId; at: number; corner: boolean }[];
  /** When each card is hit (its damage shows; if it has gone, it flies away `leave` later). */
  hits: Map<CardId, number>;
}

/** Plan an update's animation from its events, but what the Quick announcement `skip` shows itself. */
export function planTimeline(entries: readonly LogEntry[], skip: CardId | null = null): Timeline {
  const hits = new Map<CardId, number>();
  const hit = (id: CardId, at: number) => hits.set(id, Math.min(hits.get(id) ?? Infinity, at));
  const played = playedCards(entries, skip).map((p, i) => ({ ...p, at: TIMING.landed + i * TIMING.showcase }));
  const shownAt = new Map(played.map((p) => [p.id, p.at]));
  const attacks = attacksIn(entries);
  const lunges = new Map<CardId, { target: CardId; at: number }>(attacks.map((a) => [a.attacker, { target: a.target, at: TIMING.lunge }]));
  for (const { event } of entries) {
    if (event.type !== "damageDealt") continue;
    // CR 8.4.9: the attack damage, and the combat damage back to the attacker, as the attacker strikes.
    if (event.kind === "attack" && event.source !== null) {
      if (!lunges.has(event.source)) lunges.set(event.source, { target: event.target, at: 0 });
      hit(event.target, lunges.get(event.source)!.at + TIMING.strike);
    } else if (event.kind === "combat") hit(event.target, (lunges.get(event.target)?.at ?? 0) + TIMING.strike);
  }
  const selections: Timeline["selections"] = [];
  for (const selection of selectionsIn(entries, skip)) {
    const shown = shownAt.get(selection.source);
    const at = shown !== undefined ? shown + (TIMING.fromCorner - TIMING.landed) : TIMING.fromTable;
    for (const target of selection.targets) {
      if (target === selection.source) continue;
      selections.push({ source: selection.source, target, at, corner: shown !== undefined });
      hit(target, at + TIMING.strike);
    }
  }
  return { played, attacks, lunges: [...lunges].map(([attacker, l]) => ({ attacker, ...l })), selections, hits };
}
