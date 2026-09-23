import { GameOver } from "../errors";
import type { G } from "../runtime/context";
import type { Proc } from "../runtime/proc";
import { setupGame } from "./setup";
import { turnLoop } from "./turn";

/**
 * The whole game as one procedure, started either from the beginning or from a checkpoint
 * (GameState.anchor). Returns when the game is over.
 */
export function* runGame(g: G): Proc<void> {
  if (g.state.result) return;
  try {
    if (g.state.anchor?.kind === "mainPhase") {
      yield* turnLoop(g, true);
    } else {
      yield* setupGame(g);
      yield* turnLoop(g, false);
    }
  } catch (e) {
    if (e instanceof GameOver) return;
    throw e;
  }
}
