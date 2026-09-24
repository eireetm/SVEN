import { opponentOf, type PlayerId } from "../../model/ids";
import type { GameResult, LossReason } from "../../model/state";
import { GameOver } from "../errors";
import type { G } from "../runtime/context";
import type { Env } from "../state/access";
import { activeScript } from "../state/characteristics";

/**
 * BP05-092 "While this card is on your field, you can't lose the game, and opponents can't win":
 * a prohibition, which takes precedence over a loss condition or an effect (CR 1.3.3). It does
 * not stop conceding (CR 1.2.3.1).
 */
export function cannotLose(env: Env, player: PlayerId): boolean {
  return env.state.players[player].zones.field.some((id) => activeScript(env, id)?.field?.cantLose === true);
}

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
