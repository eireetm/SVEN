import type { Answer, Decision } from "../model/decision";
import { seedRng, type RngState } from "../rng/rng";
import type { GameSession } from "../engine/session";
import { legalSelection, randomAnswer } from "../engine/runtime/answers";

// The answer helpers moved to the engine (engine/runtime/answers.ts); re-exported for old callers.
export { randomAnswer } from "../engine/runtime/answers";

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
