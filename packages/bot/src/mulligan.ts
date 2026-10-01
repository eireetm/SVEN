import type { RngState } from "./core";
import { randomInt } from "./core";

/**
 * Whether to redraw (CR 6.2.1.8: the whole hand goes to the bottom of the deck, the same number of cards is drawn from its
 * top — no shuffle), judged by the curve of the first turns (the beta bots, docs/bot.md). Card-agnostic: only the costs.
 */

/** A card for the curve: its cost, and the turn of ours it is in hand from (1: the opening hand; a later draw: later). */
export interface CurveCard {
  cost: number;
  from: number;
}

/** How much the play points of each of our first four turns count (turn 1 has 1 play point: a play then matters less). */
const TURN_WEIGHTS = [0.4, 1, 1, 0.8];

/**
 * How well these cards use the play points of our first four turns (CR 7.2.1: turn t has t). Turn by turn, the cards in hand
 * by then whose costs add up closest to t are played (the most play points; ties: fewer cards). The score is the weighted
 * share of play points used: 0 (nothing to play) to 3.2 (every turn used fully).
 */
export function curveScore(cards: readonly CurveCard[]): number {
  const used = new Set<number>();
  let score = 0;
  for (let turn = 1; turn <= TURN_WEIGHTS.length; turn++) {
    const ready = cards.map((card, i) => ({ ...card, i })).filter((c) => !used.has(c.i) && c.from <= turn && c.cost <= turn && c.cost > 0);
    let best: { sum: number; picks: number[] } = { sum: 0, picks: [] };
    // At most 8 cards in hand by turn 4: every subset is cheap to try.
    for (let mask = 1; mask < 1 << ready.length; mask++) {
      let sum = 0;
      const picks: number[] = [];
      for (let b = 0; b < ready.length; b++) {
        if (mask & (1 << b)) {
          sum += ready[b]!.cost;
          picks.push(ready[b]!.i);
        }
      }
      if (sum <= turn && (sum > best.sum || (sum === best.sum && picks.length < best.picks.length))) best = { sum, picks };
    }
    for (const i of best.picks) used.add(i);
    score += TURN_WEIGHTS[turn - 1]! * (best.sum / turn);
  }
  return score;
}

/** The cards of our first four turns: the hand, then the draws (CR 7.2.4.1: the first player doesn't draw in their first turn). */
function withDraws(hand: readonly number[], draws: readonly number[], first: boolean): CurveCard[] {
  return [...hand.map((cost) => ({ cost, from: 1 })), ...draws.map((cost, i) => ({ cost, from: first ? i + 2 : i + 1 }))];
}

/** Draws until our fourth turn: three for the first player, four for the second. */
const drawsBy4 = (first: boolean) => (first ? 3 : 4);

/**
 * Knowing the deck's order (the hard bot cheats): redraw when the four cards on top, with the draws after them, make a better
 * curve than the hand with its own draws.
 */
export function redrawKnowingDeck(hand: readonly number[], deckTopFirst: readonly number[], first: boolean): boolean {
  const n = hand.length;
  const draws = drawsBy4(first);
  const keep = curveScore(withDraws(hand, deckTopFirst.slice(0, draws), first));
  const redraw = curveScore(withDraws(deckTopFirst.slice(0, n), deckTopFirst.slice(n, n + draws), first));
  return redraw > keep;
}

/**
 * Not knowing the order (a fair bot): the deck's cards, in samples of their order, give the expected curve with this hand and
 * with a new one (the same samples for both). Redraw when the new hand is better on average by more than `margin`.
 */
export function redrawByExpectation(hand: readonly number[], deck: readonly number[], first: boolean, rng: RngState, samples = 200, margin = 0.05): boolean {
  const n = hand.length;
  const draws = drawsBy4(first);
  const order = [...deck];
  let diff = 0;
  for (let s = 0; s < samples; s++) {
    // Only the cards drawn matter: a partial Fisher–Yates shuffle of the first n + draws positions.
    for (let i = 0; i < Math.min(order.length, n + draws); i++) {
      const j = i + randomInt(rng, order.length - i);
      [order[i], order[j]] = [order[j]!, order[i]!];
    }
    const keep = curveScore(withDraws(hand, order.slice(0, draws), first));
    const redraw = curveScore(withDraws(order.slice(0, n), order.slice(n, n + draws), first));
    diff += redraw - keep;
  }
  return diff / samples > margin;
}
