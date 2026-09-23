import { opponentOf, type PlayerId } from "../../model/ids";
import type { GameResult, LossReason } from "../../model/state";
import { GameOver } from "../errors";
import type { G } from "../runtime/context";

/**
 * CR 1.2 — the game concludes when a player loses; if all players lose simultaneously the
 * game is a draw (1.2.2). Throws GameOver to unwind the running procedures.
 */
export function endGame(g: G, losses: readonly { player: PlayerId; reason: LossReason }[]): never {
  const losers = [...new Set(losses.map((l) => l.player))];
  const winner = losers.length === 1 ? opponentOf(losers[0]!) : null;
  const result: GameResult = { winner, losses: [...losses] };
  g.state.result = result;
  g.state.phase = "over";
  g.state.attack = null;
  g.emit({ type: "gameEnded", result });
  throw new GameOver(result);
}
