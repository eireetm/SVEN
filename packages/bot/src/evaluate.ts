import { opponentOf, type CardView, type Keyword, type PlayerId, type PlayerSideView, type PlayerView } from "./core";

/**
 * How much each visible feature of a position is worth, in "leader defense points". The
 * evaluation is card-agnostic on purpose: it scores what the engine produced (board, hands,
 * points), never what a particular card is, so new cards and sets need no changes here.
 */
export interface EvalWeights {
  /** A won game (a lost one is minus this; a draw is 0). */
  win: number;
  /** Per point of leader defense. */
  leader: number;
  /** Extra per point of leader defense below `dangerLine` (low defense matters more). */
  leaderDanger: number;
  dangerLine: number;
  /** Per point of attack / defense of a follower on the field. */
  attack: number;
  defense: number;
  /** Per keyword of a follower on the field. */
  keywords: Partial<Record<Keyword, number>>;
  /** An evolved follower (its stats are counted already; this is for its evolve effects spent). */
  evolved: number;
  /** An amulet on the field. */
  amulet: number;
  /** Per counter on a card on the field (Stack, grace, calamity ...). */
  counter: number;
  /** Per card in hand, up to `handCap` (CR 7.4.7 hand limit). */
  hand: number;
  handCap: number;
  /** Per card in the EX area (it can be played from there). */
  ex: number;
  /** A crest in the EX area: not a card to play but an effect that lasts (CR 10.3.6, BP20). */
  crest: number;
  /** An equipment token: an effect its follower has while it stays on the field (CR 14.5.2, CP04). */
  equipment: number;
  evolutionPoint: number;
  superEvolutionPoint: number;
  /** Per maximum play point (up to 10). */
  maxPlayPoint: number;
  /** Per unused play point: a little, so that a useless action isn't preferred to keeping them. */
  playPoint: number;
  /** Per card missing below 3 in the deck (drawing from an empty deck loses). */
  deckDanger: number;
  /** Instead of `leader` and `leaderDanger`, when given: a curve (LeaderCurve). */
  leaderCurve?: LeaderCurve;
}

/**
 * The leader's defense valued on a curve (the beta bots): the n-th point is worth
 * `base + extra · e^(−(n−1)/scale)`, so the last points, which decide the game, are worth the most, and spare points at full
 * defense less (they can pay for trades). Before the curve, the defense counted is lowered by `threat` times the attack of
 * the other side's followers: what they could deal on their next turn.
 */
export interface LeaderCurve {
  base: number;
  extra: number;
  scale: number;
  threat: number;
}

/**
 * The value of `defense` points of leader defense on a curve (its sum over points, in closed form; works for fractions).
 * Below 0 (the threat is larger than the defense) it goes on with the first point's worth, so more defense is still better.
 */
export function curveValue(defense: number, c: LeaderCurve): number {
  if (defense <= 0) return (c.base + c.extra) * defense;
  const r = Math.exp(-1 / c.scale);
  return c.base * defense + (c.extra * (1 - r ** defense)) / (1 - r);
}

export const DEFAULT_WEIGHTS: EvalWeights = {
  win: 1_000_000,
  leader: 1,
  leaderDanger: 0.5,
  dangerLine: 8,
  attack: 1,
  defense: 0.6,
  keywords: { ward: 1, bane: 1.5, drain: 0.5, aura: 1, intimidate: 0.3, assail: 0.3, rush: 0.2, storm: 0.2 },
  evolved: 0.5,
  amulet: 2,
  counter: 0.3,
  hand: 1.5,
  handCap: 7,
  ex: 1,
  crest: 2,
  equipment: 1.5,
  evolutionPoint: 1.5,
  superEvolutionPoint: 2,
  maxPlayPoint: 0.5,
  playPoint: 0.1,
  deckDanger: 3,
};

/** The position from `me`'s point of view: positive is good for `me`. Uses only what `me` sees. */
export function evaluate(view: PlayerView, me: PlayerId, w: EvalWeights = DEFAULT_WEIGHTS): number {
  if (view.result) return view.result.winner === me ? w.win : view.result.winner === null ? 0 : -w.win;
  const [mine, theirs] = [view.players[me], view.players[opponentOf(me)]];
  return sideValue(mine, theirs, w) - sideValue(theirs, mine, w);
}

/** The attack of a side's followers on the field: what they could deal next turn. */
function boardAttack(s: PlayerSideView): number {
  let sum = 0;
  for (const card of s.field) if (!card.hidden && card.type === "follower") sum += Math.max(0, card.attack ?? 0);
  return sum;
}

function leaderValue(s: PlayerSideView, other: PlayerSideView, w: EvalWeights): number {
  const curve = w.leaderCurve;
  if (!curve) return s.leaderDefense * w.leader - Math.max(0, w.dangerLine - s.leaderDefense) * w.leaderDanger;
  return curveValue(s.leaderDefense - curve.threat * boardAttack(other), curve);
}

function sideValue(s: PlayerSideView, other: PlayerSideView, w: EvalWeights): number {
  let v = leaderValue(s, other, w);
  // A facedown card (a Starting Amulet before the redraws, CR 14.4.3) counts as an amulet.
  for (const card of s.field) v += card.hidden ? w.amulet : fieldCardValue(card, w);
  v += Math.min(s.hand.length, w.handCap) * w.hand;
  for (const card of s.ex) v += card.type === "crest" ? w.crest + Object.values(card.counters).reduce((a, b) => a + b, 0) * w.counter : w.ex;
  v += s.equipmentZone.length * w.equipment;
  v += s.evolutionPoints * w.evolutionPoint + s.superEvolutionPoints * w.superEvolutionPoint;
  v += Math.min(s.maxPlayPoints, 10) * w.maxPlayPoint + s.playPoints * w.playPoint;
  if (s.deckCount < 3) v -= (3 - s.deckCount) * w.deckDanger;
  return v;
}

function fieldCardValue(c: CardView, w: EvalWeights): number {
  const counters = Object.values(c.counters).reduce((a, b) => a + b, 0) * w.counter;
  if (c.type !== "follower" || c.attack === null || c.defense === null) return w.amulet + counters;
  let v = Math.max(0, c.attack) * w.attack + Math.max(0, c.defense) * w.defense + counters;
  for (const k of c.keywords) v += w.keywords[k] ?? 0;
  if (c.evolvedWith !== null) v += w.evolved;
  return v;
}
