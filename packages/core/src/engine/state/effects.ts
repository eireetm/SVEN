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
