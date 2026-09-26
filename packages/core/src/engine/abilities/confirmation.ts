import { opponentOf } from "../../model/ids";
import type { G } from "../runtime/context";
import { decide } from "../runtime/decide";
import type { Proc } from "../runtime/proc";
import { EngineError } from "../errors";
import { endGame } from "../flow/end-game";
import { runRulesHandling } from "../rules-handling";
import { playPendingAbility } from "./play-ability";

/**
 * CR 15.2.1.3 — a perpetual cycle that neither player can stop ends the game in a draw. A cycle of
 * automatic abilities keeps one Confirmation Timing going forever; the engine can't decide in
 * general whether a player could stop it, so it treats a Confirmation Timing that plays this many
 * abilities as such a cycle. No real game comes close (a full board of Last Words is a few dozen);
 * the limit exists so that the engine always returns.
 */
export const PERPETUAL_CYCLE_LIMIT = 1000;

/**
 * CR 10.5 — Confirmation Timing.
 *  10.5.2.1 all rules handling (repeated until none applies);
 *  10.5.2.2 the active player plays one of their pending automatic abilities, back to .1;
 *  10.5.2.3 then the non-active player, back to .1;
 *  10.5.2.4 end (or a draw by CR 15.2.1.3, see PERPETUAL_CYCLE_LIMIT).
 */
export function* confirmationTiming(g: G): Proc<void> {
  let abilitiesPlayed = 0;
  for (;;) {
    yield* runRulesHandling(g);
    const active = g.state.activePlayer;
    let played = false;
    for (const p of [active, opponentOf(active)]) {
      const mine = g.state.pending.filter((x) => x.controller === p);
      if (mine.length === 0) continue;
      // 10.7.3.1 — must be played, but the player chooses the order.
      const answer = yield* decide(g, { type: "selectPending", player: p, options: mine.map((x) => x.id) });
      if (answer.type !== "selectPending") throw new EngineError("unreachable");
      yield* playPendingAbility(g, answer.id);
      played = true;
      if (++abilitiesPlayed >= PERPETUAL_CYCLE_LIMIT) {
        endGame(g, [
          { player: 0, reason: "perpetualCycle" },
          { player: 1, reason: "perpetualCycle" },
        ]);
      }
      break;
    }
    if (!played) return;
  }
}
