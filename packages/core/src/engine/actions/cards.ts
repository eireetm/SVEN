import type { DefId } from "../../model/card";
import type { CardId, PlayerId } from "../../model/ids";
import type { MoveReason } from "../../events/types";
import { randomInt, shuffleInPlace } from "../../rng/rng";
import { infoDefId } from "../state/characteristics";
import type { G } from "../runtime/context";
import { chooseOptions, selectCards } from "../runtime/decide";
import type { Proc } from "../runtime/proc";
import { getCard } from "../state/access";
import { hasKeyword, isFollowerOnField } from "../state/characteristics";
import { exAreaLimit, fieldLimit } from "../state/limits";
import { createCards, moveCards } from "../state/zones";

/**
 * CR 5.22 — steal a card on an opponent's field: move it onto `newController`'s field.
 * Nothing happens when that field is full (CR 4.4.4.2, 1.3.2). Returns the card's new id.
 */
export function stealCard(g: G, card: CardId, newController: PlayerId): CardId | null {
  const c = g.state.cards[card];
  if (!c || c.zone !== "field" || c.controller === newController) return null;
  const room = fieldLimit(g, newController) - g.state.players[newController].zones.field.length;
  if (room <= 0) return null;
  const [id] = moveCards(g, [{ card, to: "field", player: newController, keepEffects: true, keepState: true }], "effect");
  return id ?? null;
}

/** Shuffle these cards and put them on the bottom of their owner's deck (CR 5.9). */
export function shuffleToBottom(g: G, cards: readonly CardId[]): void {
  const present = cards.filter((id) => g.state.cards[id] !== undefined);
  if (present.length === 0) return;
  const order = [...present];
  shuffleInPlace(g.state.rng, order);
  moveCards(g, order.map((card) => ({ card, to: "deck" as const, position: "bottom" as const })), "effect");
}

/** CR 5.9 — shuffle a deck (5.9.1.1: with 0–1 cards nothing changes but it still counts). */
export function shuffleDeck(g: G, p: PlayerId): void {
  shuffleInPlace(g.state.rng, g.state.players[p].zones.deck);
  g.emit({ type: "deckShuffled", player: p });
}

/**
 * CR 5.10 — draw `count` cards one at a time (5.10.2). Drawing from an empty deck marks the
 * player; rules handling makes them lose (5.10.1.1, 11.2.2).
 */
export function drawCards(g: G, p: PlayerId, count: number): CardId[] {
  const drawn: CardId[] = [];
  const ps = g.state.players[p];
  for (let i = 0; i < count; i++) {
    const top = ps.zones.deck[0];
    if (top === undefined) {
      ps.drewFromEmptyDeck = true;
      continue;
    }
    drawn.push(...moveCards(g, [{ card: top, to: "hand", player: p }], "draw"));
  }
  return drawn;
}

/** Put the top `count` cards of a deck into its owner's cemetery (as many as there are, 1.3.2). */
export function millCards(g: G, p: PlayerId, count: number): CardId[] {
  const top = g.state.players[p].zones.deck.slice(0, Math.max(0, count));
  return moveCards(g, top.map((card) => ({ card, to: "cemetery" as const })), "effect");
}

/** CR 5.4 — engage or refresh. Cards already in that state are skipped (CR 1.3.2.1). */
export function setEngaged(g: G, cards: readonly CardId[], engaged: boolean): CardId[] {
  const changed = cards.filter((id) => g.state.cards[id] !== undefined && g.state.cards[id]!.engaged !== engaged);
  if (changed.length === 0) return changed;
  for (const id of changed) getCard(g.state, id).engaged = engaged;
  g.emit({ type: "placementChanged", cards: changed, engaged });
  return changed;
}

/** CR 5.6 — destroy cards on the field: move them to their owners' cemeteries. */
export function destroyCards(g: G, cards: readonly CardId[]): CardId[] {
  // CR 1.3.3 — "This card can't be destroyed by abilities" prohibits destroying it here (this
  // is only called for effects; rules handling destroys through moveCards directly).
  const onField = cards.filter(
    (id) => g.state.cards[id]?.zone === "field" && !g.scripts[infoDefId(g, id)]?.cannotBeDestroyedByAbilities,
  );
  if (onField.length === 0) return [];
  return moveCards(g, onField.map((card) => ({ card, to: "cemetery" as const })), "destroy");
}

/** CR 5.34 — bury: put cards into their owners' cemeteries without destroying them. */
export function buryCards(g: G, cards: readonly CardId[]): CardId[] {
  const present = cards.filter((id) => g.state.cards[id] !== undefined);
  return present.length === 0 ? [] : moveCards(g, present.map((card) => ({ card, to: "cemetery" as const })), "effect");
}

/** CR 5.7 — banish cards: move them to their owners' banished zones. */
export function banishCards(g: G, cards: readonly CardId[]): CardId[] {
  const present = cards.filter((id) => g.state.cards[id] !== undefined);
  return present.length === 0 ? [] : moveCards(g, present.map((card) => ({ card, to: "banished" as const })), "banish");
}

/** Return cards to their owners' hands (CR 4.1.6: the owner's zone). */
export function returnToHand(g: G, cards: readonly CardId[]): CardId[] {
  const present = cards.filter((id) => g.state.cards[id] !== undefined);
  return present.length === 0 ? [] : moveCards(g, present.map((card) => ({ card, to: "hand" as const })), "effect");
}

/** CR 5.12 — discard the given hand cards to their owner's cemetery. */
export function discardCards(g: G, cards: readonly CardId[]): CardId[] {
  if (cards.length === 0) return [];
  return moveCards(g, cards.map((card) => ({ card, to: "cemetery" as const })), "discard");
}

/** CR 5.19 / 5.12 — discard `count` cards chosen at random from the player's hand (seeded RNG). */
export function discardRandomCards(g: G, p: PlayerId, count: number): CardId[] {
  const hand = [...g.state.players[p].zones.hand];
  const chosen: CardId[] = [];
  for (let i = 0; i < count && hand.length > 0; i++) chosen.push(hand.splice(randomInt(g.state.rng, hand.length), 1)[0]!);
  return discardCards(g, chosen);
}

/** CR 5.21 — reveal cards to all players until the current effect has been resolved. */
export function revealCards(g: G, player: PlayerId, cards: readonly CardId[]): void {
  if (cards.length === 0) return;
  for (const id of cards) if (!g.state.revealed.includes(id)) g.state.revealed.push(id);
  g.emit({ type: "cardsRevealed", player, cards: cards.map((id) => ({ id, def: getCard(g.state, id).def })) });
}

/**
 * CR 12.8.2 (i) — followers with Ward just put onto the field reserved may be engaged
 * instead; the controller picks which (one decision for cards entering together).
 */
function* wardEntry(g: G, player: PlayerId, entered: readonly CardId[]): Proc<void> {
  const wards = entered.filter(
    (id) => isFollowerOnField(g, id) && !getCard(g.state, id).engaged && hasKeyword(g, id, "ward"),
  );
  if (wards.length === 0) return;
  const chosen = yield* selectCards(g, player, "wardEnterEngaged", wards, 0, wards.length);
  setEngaged(g, chosen, true);
}

/**
 * CR 5.5 — put cards onto `player`'s field.
 *  - 4.4.4.2: if they do not all fit, the controller of the effect (`chooser`) picks which
 *    ones move; the rest stay where they are.
 *  - cards whose script says so enter engaged; 12.8.2 (i) Ward followers may be engaged.
 * Returns the new ids of the cards that entered the field.
 */
export function* putOntoField(
  g: G,
  cards: readonly CardId[],
  player: PlayerId,
  reason: MoveReason,
  opts: { chooser?: PlayerId; keepEffects?: boolean } = {},
): Proc<CardId[]> {
  const room = fieldLimit(g, player) - g.state.players[player].zones.field.length;
  let chosen: readonly CardId[] = cards;
  if (cards.length > room) {
    chosen = room <= 0 ? [] : yield* selectCards(g, opts.chooser ?? player, "zoneEntry", cards, room, room);
  }
  if (chosen.length === 0) return [];
  const entered = moveCards(
    g,
    chosen.map((card) => ({
      card,
      to: "field" as const,
      player,
      keepEffects: opts.keepEffects ?? false,
      engaged: g.scripts[getCard(g.state, card).def]?.entersEngaged ?? false,
    })),
    reason,
  );
  yield* wardEntry(g, player, entered);
  return entered;
}

/**
 * CR 4.8.3.2 — move cards into their owners' EX areas; if they do not all fit, the
 * controller of the effect picks which. Returns the new ids of the moved cards.
 */
export function* putIntoEx(g: G, cards: readonly CardId[], chooser: PlayerId): Proc<CardId[]> {
  const moved: CardId[] = [];
  for (const owner of [0, 1] as PlayerId[]) {
    const mine = cards.filter((id) => g.state.cards[id]?.owner === owner);
    if (mine.length === 0) continue;
    const room = exAreaLimit(g, owner) - g.state.players[owner].zones.ex.length;
    const chosen = mine.length <= room ? mine : room <= 0 ? [] : yield* selectCards(g, chooser, "zoneEntry", mine, room, room);
    if (chosen.length > 0) moved.push(...moveCards(g, chosen.map((card) => ({ card, to: "ex" as const })), "effect"));
  }
  return moved;
}

/**
 * CR 5.5.2 / 9.1.2 — create tokens in `player`'s field or EX area. When they do not all fit
 * (4.4.4.2 / 4.8.3.2) the controller of the effect chooses which are created (BP01-032,
 * BP01-101 rulings). Returns the ids of the created tokens.
 */
export function* createTokens(
  g: G,
  chooser: PlayerId,
  player: PlayerId,
  defs: readonly DefId[],
  zone: "field" | "ex",
  source: CardId | null = null,
): Proc<CardId[]> {
  const limit = zone === "field" ? fieldLimit(g, player) : exAreaLimit(g, player);
  const room = Math.max(0, limit - g.state.players[player].zones[zone].length);
  let chosen = [...defs];
  if (defs.length > room) {
    if (new Set(defs).size === 1) chosen = defs.slice(0, room);
    else {
      const options = defs.map((d, i) => ({ id: String(i), label: g.db.get(d).name }));
      const ids = yield* chooseOptions(g, chooser, "token", options, room, room, source);
      chosen = ids.map((i) => defs[Number(i)]!);
    }
  }
  if (chosen.length === 0) return [];
  const created = createCards(g, chosen.map((def) => ({ def, player, to: zone })), "effect");
  if (zone === "field") yield* wardEntry(g, player, created);
  return created;
}

/**
 * CR 5.17 — transform: banish the cards, then create one token of `tokenDef` in the zone
 * each card was in (BP01-001 ruling). Returns the created tokens.
 */
export function* transformCards(g: G, cards: readonly CardId[], tokenDef: DefId, chooser: PlayerId): Proc<CardId[]> {
  const places = cards
    .filter((id) => g.state.cards[id] !== undefined)
    .map((id) => ({ player: getCard(g.state, id).controller, zone: getCard(g.state, id).zone }));
  banishCards(g, cards);
  const created: CardId[] = [];
  for (const place of places) {
    if (place.zone !== "field" && place.zone !== "ex") continue;
    created.push(...(yield* createTokens(g, chooser, place.player, [tokenDef], place.zone)));
  }
  return created;
}
