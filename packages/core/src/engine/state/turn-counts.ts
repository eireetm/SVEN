import type { PlayerId } from "../../model/ids";
import type { GameState, TurnCounts } from "../../model/state";

/**
 * The player's counts for the current turn, reset lazily when a new turn has begun. Used for
 * "this turn" conditions: discards (CR 5.12), destroyed followers (5.6), follower attacks (8.4.5).
 */
export function thisTurn(state: GameState, player: PlayerId): TurnCounts {
  const ps = state.players[player];
  if (ps.thisTurn.turn !== state.turn) {
    ps.thisTurn = { turn: state.turn, discarded: 0, followersDestroyed: 0, followerAttacks: 0, returnedToHand: 0, played: [] };
  }
  return ps.thisTurn;
}

/** Read-only view of `thisTurn` (zero when nothing happened this turn). */
export function countsThisTurn(state: Readonly<GameState>, player: PlayerId): TurnCounts {
  const t = state.players[player].thisTurn;
  return t.turn === state.turn
    ? t
    : { turn: state.turn, discarded: 0, followersDestroyed: 0, followerAttacks: 0, returnedToHand: 0, played: [] };
}
