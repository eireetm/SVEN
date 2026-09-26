import type { Decision } from "../model/decision";
import type { CardId, PlayerId } from "../model/ids";
import type { GameState, PlayerZone } from "../model/state";
import { shuffleInPlace, type RngState } from "../rng/rng";
import { cardVisibleTo } from "../view/visibility";

/**
 * Information-set sampling for bots (docs/bot.md): deal the cards `viewer` can't identify (CR 4.1.2)
 * again at random, so that a copy of the game tells nothing the viewer doesn't know.
 *
 * Pools of cards that could be swapped with each other, as the viewer sees them:
 *  - an opponent's hand and deck together (a card in the hand could be any card not seen yet);
 *  - an opponent's facedown evolve deck cards (4.6.2), and their facedown banished cards (4.10.2);
 *  - the viewer's own deck, whose order nobody knows (4.5.2).
 * The multiset of each pool stays the real one: the opponent's deck list counts as known. Cards the
 * viewer has been shown (`keep`, the revealed cards) keep their identity. Only `def` and `printing`
 * move; everything else (effects on the card, counters) stays with the slot, which is what the
 * viewer knows ("the second card in their hand costs 1 less").
 */
export function resampleHidden(state: GameState, viewer: PlayerId, rng: RngState, keep: ReadonlySet<CardId>): void {
  for (const pool of hiddenPools(state, viewer, keep)) {
    if (pool.length < 2) continue;
    const identities = pool.map((id) => ({ def: state.cards[id]!.def, printing: state.cards[id]!.printing }));
    // Sorted first, so the sample depends only on which cards are hidden, not on where they really are.
    identities.sort((a, b) => compare(a.def, b.def) || compare(a.printing, b.printing));
    shuffleInPlace(rng, identities);
    pool.forEach((id, i) => {
      const card = state.cards[id]!;
      card.def = identities[i]!.def;
      card.printing = identities[i]!.printing;
    });
  }
}

const POOL_ZONES: readonly (readonly PlayerZone[])[] = [["hand", "deck"], ["evolveDeck"], ["banished"]];

function hiddenPools(state: GameState, viewer: PlayerId, keep: ReadonlySet<CardId>): CardId[][] {
  const hidden = (id: CardId) => !keep.has(id) && !state.revealed.includes(id) && !cardVisibleTo(state.cards[id]!, viewer);
  const pools: CardId[][] = [];
  for (const p of [0, 1] as const) {
    const zones = state.players[p].zones;
    for (const group of POOL_ZONES) pools.push(group.flatMap((zone) => zones[zone]).filter(hidden));
  }
  return pools;
}

function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** The cards a decision shows its player (candidates, cards looked at, the actions' cards). */
export function cardsInDecision(d: Decision | null): CardId[] {
  if (!d) return [];
  const opt = (id: CardId | null | undefined) => (id === null || id === undefined ? [] : [id]);
  switch (d.type) {
    case "chooseTurnOrder":
    case "selectPending":
      return [];
    case "mulligan":
      return [...d.hand];
    case "mainPhase":
      return d.actions.flatMap((a) => {
        switch (a.type) {
          case "play":
          case "activate":
            return [a.card];
          case "evolve":
            return [a.card, a.evolveCard];
          case "attack":
            return [a.attacker, a.target];
          case "endMainPhase":
            return [];
        }
      });
    case "quick":
      return d.actions.flatMap((a) => (a.type === "pass" ? [] : [a.card]));
    case "selectCards":
      return [...d.candidates, ...(d.peek ?? []).map((c) => c.id), ...(d.mandatory ?? []), ...opt(d.source)];
    case "choose":
      return [...opt(d.source), ...opt(d.subject?.id)];
    case "orderCards":
      return [...d.cards.map((c) => c.id), ...opt(d.source)];
    case "confirm":
      return [...opt(d.source), ...opt(d.subject?.id)];
  }
}
