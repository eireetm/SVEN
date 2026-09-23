import { opponentOf } from "../../model/ids";
import type { G } from "../runtime/context";
import { decide } from "../runtime/decide";
import type { Proc } from "../runtime/proc";
import { EngineError } from "../errors";
import { runRulesHandling } from "../rules-handling";
import { playPendingAbility } from "./play-ability";

/**
 * CR 10.5 — Confirmation Timing.
 *  10.5.2.1 all rules handling (repeated until none applies);
 *  10.5.2.2 the active player plays one of their pending automatic abilities, back to .1;
 *  10.5.2.3 then the non-active player, back to .1;
 *  10.5.2.4 end.
 */
export function* confirmationTiming(g: G): Proc<void> {
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
      break;
    }
    if (!played) return;
  }
}
