import type { GameState, PersistentEffect } from "../../model/state";

/**
 * Is a persistent effect in force now? An "endOfOpponentsNextTurn" effect ("for the rest of
 * this turn and during each opponent's next turn", BP02-090) applies in its creation turn and in
 * turns of the controller's opponent, not in the controller's own later turns (e.g. an extra
 * turn, CR 5.28). Other effects apply until they are removed.
 */
export function effectInForce(state: Readonly<GameState>, e: PersistentEffect): boolean {
  if (e.until !== "endOfOpponentsNextTurn") return true;
  return state.turn === e.createdTurn || state.activePlayer !== e.controller;
}

/**
 * BP03-039/040 — an effect is stopping this card's activated abilities. Evolve abilities stay
 * playable when the effect says "except Evolve".
 */
export function activationBlocked(state: Readonly<GameState>, card: string, evolve: boolean): boolean {
  return state.effects.some(
    (e) =>
      e.target === card &&
      effectInForce(state, e) &&
      e.change.kind === "cantActivate" &&
      !(evolve && e.change.exceptEvolve),
  );
}

/** CR 8.4.3.2.1 — an effect says this follower can't attack enemies. */
export function effectPreventsAttack(state: Readonly<GameState>, card: string): boolean {
  return state.effects.some((e) => e.target === card && effectInForce(state, e) && e.change.kind === "cannotAttack");
}
