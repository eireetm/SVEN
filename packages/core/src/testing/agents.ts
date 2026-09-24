import type { Answer, Decision } from "../model/decision";
import { randomInt, seedRng, shuffleInPlace, type RngState } from "../rng/rng";
import type { GameSession } from "../engine/session";

/** Something that answers decisions (a bot, a scripted test player, ...). */
export type Agent = (decision: Decision, session: GameSession) => Answer;

/**
 * Answers every decision with a uniformly random legal answer. Uses its own RNG so it never
 * consumes the game's randomness.
 */
export function randomAgent(seed: string | number): Agent {
  const rng: RngState = seedRng(`agent:${seed}`);
  return (d) => randomAnswer(rng, d);
}

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
 * A legal selection of `n` cards that includes as many `mandatory` cards as the size allows
 * (CR 1.3.2.3). `order` decides which cards are preferred.
 */
function legalSelection(order: readonly string[], mandatory: readonly string[], n: number): string[] {
  const must = new Set(mandatory);
  const first = order.filter((id) => must.has(id));
  const rest = order.filter((id) => !must.has(id));
  return [...first, ...rest].slice(0, n);
}

/** Always takes the first option / minimum selection. Deterministic and cheap. */
export const firstOptionAgent: Agent = (d) => {
  switch (d.type) {
    case "chooseTurnOrder":
      return { type: "chooseTurnOrder", goFirst: true };
    case "mulligan":
      return { type: "mulligan", redraw: false };
    case "mainPhase":
      return { type: "mainPhase", action: d.actions[0]! };
    case "quick":
      return { type: "quick", action: d.actions[0]! };
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
};

/**
 * Let agents answer decisions until the game ends or `maxSteps` inputs were given.
 * `onStep` runs after each input (e.g. invariant checks). Returns the number of inputs.
 */
export function playOut(
  session: GameSession,
  agents: readonly [Agent, Agent],
  opts: { maxSteps?: number; onStep?: (session: GameSession, answer: Answer) => void } = {},
): number {
  const max = opts.maxSteps ?? 10_000;
  let steps = 0;
  while (session.decision && steps < max) {
    const d = session.decision;
    const answer = agents[d.player](d, session);
    session.act(answer);
    steps += 1;
    opts.onStep?.(session, answer);
  }
  return steps;
}
