import type { Answer, Decision } from "../../model/decision";
import type { CardId } from "../../model/ids";
import { randomInt, shuffleInPlace, type RngState } from "../../rng/rng";

/**
 * Legal answers for any decision, for bots, tools and GUIs. Every decision type has all three
 * helpers here, so a new decision type must be added here too (see docs/architecture.md 9):
 * that is what keeps bots working when the rules grow.
 */

/**
 * A cheap, always legal answer that never prolongs the game: end the main phase, pass, decline,
 * keep the hand, select or choose as few as allowed (forced cards first, CR 1.3.2.3). A player
 * who keeps answering this way stops any cycle they could stop (CR 15.2.1.1).
 */
export function defaultAnswer(d: Decision): Answer {
  switch (d.type) {
    case "chooseTurnOrder":
      return { type: "chooseTurnOrder", goFirst: true };
    case "mulligan":
      return { type: "mulligan", redraw: false };
    case "mainPhase":
      return { type: "mainPhase", action: d.actions.find((a) => a.type === "endMainPhase") ?? d.actions[0]! };
    case "quick":
      return { type: "quick", action: d.actions.find((a) => a.type === "pass") ?? d.actions[0]! };
    case "selectPending":
      return { type: "selectPending", id: d.options[0]! };
    case "selectCards":
      return { type: "selectCards", cards: legalSelection(d.candidates, d.mandatory ?? [], d.min) };
    case "choose":
      return { type: "choose", ids: d.options.slice(0, d.min).map((o) => o.id) };
    case "orderCards":
      return { type: "orderCards", order: d.cards.map((c) => c.id) };
    case "confirm":
      return { type: "confirm", yes: false };
  }
}

/** A uniformly random legal answer, drawn from the caller's RNG (never the game's). */
export function randomAnswer(rng: RngState, d: Decision): Answer {
  const pick = <T>(xs: readonly T[]): T => xs[randomInt(rng, xs.length)]!;
  switch (d.type) {
    case "chooseTurnOrder":
      return { type: "chooseTurnOrder", goFirst: randomInt(rng, 2) === 0 };
    case "mulligan": {
      const redraw = randomInt(rng, 2) === 0;
      if (!redraw) return { type: "mulligan", redraw };
      const order = [...d.hand];
      shuffleInPlace(rng, order);
      return { type: "mulligan", redraw, bottomOrder: order };
    }
    case "mainPhase":
      return { type: "mainPhase", action: pick(d.actions) };
    case "quick":
      return { type: "quick", action: pick(d.actions) };
    case "selectPending":
      return { type: "selectPending", id: pick(d.options) };
    case "selectCards": {
      const n = d.min + randomInt(rng, d.max - d.min + 1);
      const pool = [...d.candidates];
      shuffleInPlace(rng, pool);
      return { type: "selectCards", cards: legalSelection(pool, d.mandatory ?? [], n) };
    }
    case "choose": {
      const n = d.min + randomInt(rng, d.max - d.min + 1);
      const pool = d.options.map((o) => o.id);
      shuffleInPlace(rng, pool);
      return { type: "choose", ids: pool.slice(0, n) };
    }
    case "orderCards": {
      const order = d.cards.map((c) => c.id);
      shuffleInPlace(rng, order);
      return { type: "orderCards", order };
    }
    case "confirm":
      return { type: "confirm", yes: randomInt(rng, 2) === 0 };
  }
}

/**
 * Up to `limit` distinct legal answers, the default answer first. `complete` tells whether these
 * are all of them: selections, choices and orders can have very many (e.g. "any number of cards"
 * among 25 candidates), and callers then sample instead.
 */
export function enumerateAnswers(d: Decision, limit: number): { answers: Answer[]; complete: boolean } {
  const out: Answer[] = [];
  const seen = new Set<string>();
  const add = (a: Answer): boolean => {
    const key = JSON.stringify(a);
    if (!seen.has(key)) {
      if (out.length >= limit) return false;
      seen.add(key);
      out.push(a);
    }
    return true;
  };
  let complete = true;
  add(defaultAnswer(d));
  switch (d.type) {
    case "chooseTurnOrder":
      complete = add({ type: "chooseTurnOrder", goFirst: false });
      break;
    case "mulligan":
      complete = add({ type: "mulligan", redraw: true, bottomOrder: [...d.hand] });
      break;
    case "mainPhase":
      for (const action of d.actions) if (!(complete = add({ type: "mainPhase", action }))) break;
      break;
    case "quick":
      for (const action of d.actions) if (!(complete = add({ type: "quick", action }))) break;
      break;
    case "selectPending":
      for (const id of d.options) if (!(complete = add({ type: "selectPending", id }))) break;
      break;
    case "selectCards":
      complete = eachSelection(d.candidates, d.mandatory ?? [], d.min, d.max, (cards) => add({ type: "selectCards", cards }));
      break;
    case "choose": {
      const ids = d.options.map((o) => o.id);
      complete = eachSelection(ids, [], d.min, d.max, (chosen) => add({ type: "choose", ids: chosen }));
      break;
    }
    case "orderCards":
      complete = eachPermutation(
        d.cards.map((c) => c.id),
        (order) => add({ type: "orderCards", order }),
      );
      break;
    case "confirm":
      complete = add({ type: "confirm", yes: true });
      break;
  }
  return { answers: out, complete };
}

/**
 * A legal selection of `n` cards that includes as many `mandatory` cards as the size allows
 * (CR 1.3.2.3). `order` decides which cards are preferred.
 */
export function legalSelection(order: readonly CardId[], mandatory: readonly CardId[], n: number): CardId[] {
  const must = new Set(mandatory);
  const first = order.filter((id) => must.has(id));
  const rest = order.filter((id) => !must.has(id));
  return [...first, ...rest].slice(0, n);
}

/**
 * Calls `visit` with every legal selection of `min`–`max` items (smallest first), each including
 * as many `mandatory` items as its size allows (CR 1.3.2.3). Stops when `visit` returns false and
 * then returns false.
 */
function eachSelection<T>(
  items: readonly T[],
  mandatory: readonly T[],
  min: number,
  max: number,
  visit: (selection: T[]) => boolean,
): boolean {
  const must = items.filter((x) => mandatory.includes(x));
  const rest = items.filter((x) => !mandatory.includes(x));
  for (let size = min; size <= Math.min(max, items.length); size++) {
    // Only mandatory items while they last; then all of them plus others.
    const ok =
      size <= must.length
        ? eachCombination(must, size, visit)
        : eachCombination(rest, size - must.length, (others) => visit([...must, ...others]));
    if (!ok) return false;
  }
  return true;
}

function eachCombination<T>(items: readonly T[], k: number, visit: (combo: T[]) => boolean): boolean {
  const combo: T[] = [];
  const go = (start: number): boolean => {
    if (combo.length === k) return visit([...combo]);
    for (let i = start; i <= items.length - (k - combo.length); i++) {
      combo.push(items[i]!);
      if (!go(i + 1)) return false;
      combo.pop();
    }
    return true;
  };
  return go(0);
}

function eachPermutation<T>(items: readonly T[], visit: (order: T[]) => boolean): boolean {
  const used = new Array<boolean>(items.length).fill(false);
  const order: T[] = [];
  const go = (): boolean => {
    if (order.length === items.length) return visit([...order]);
    for (let i = 0; i < items.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      order.push(items[i]!);
      if (!go()) return false;
      order.pop();
      used[i] = false;
    }
    return true;
  };
  return go();
}
