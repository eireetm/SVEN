import type { PlayerId } from "../../model/ids";
import type { GameState, PlayerRestriction } from "../../model/state";

/**
 * BP05-006 — is `player` under this restriction now? A restriction applies in the player's
 * first turn after the turn it was created in; it is removed at the end of that turn
 * (engine/flow/end-phase.ts), so any one left from an earlier turn is for this turn.
 */
export function restricted(state: Readonly<GameState>, player: PlayerId, kind: PlayerRestriction["kind"]): boolean {
  return (
    state.activePlayer === player &&
    state.restrictions.some((r) => r.player === player && r.kind === kind && state.turn > r.createdTurn)
  );
}
