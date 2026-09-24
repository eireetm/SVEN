// BP02-036 Daria, Dimensional Witch (Evolved) — 6/6.
// While this card is on your field, include both spells and {[runecraft]} followers when counting
// your Spellchain (CR 13.3.1.1).
// On Evolve: Select a follower in your EX area. For the rest of this turn, it costs 5 less to play.
// On Evolve: Select a spell in your EX area. For the rest of this turn, it costs 5 less to play.
// (CR 10.4.4.1; with BP01-057's "costs 7" option: 7 - 5 = 2 — ruling, set-to-value first 10.10.2.4.)
import { defineCard, onEvolve } from "../helpers";
import { inYourZone, isFollower, isSpell } from "../targets";
import type { EffectContext } from "../../engine/effects/context";

function* fiveLess(fx: EffectContext) {
  yield* fx.changePlayCost(fx.targets[0]![0]!, -5, "endOfTurn");
}

export default defineCard({
  field: { spellchainCountsRunecraftFollowers: true },
  abilities: [
    onEvolve({ targets: [inYourZone("ex", { filter: isFollower })], resolve: fiveLess }),
    onEvolve({ targets: [inYourZone("ex", { filter: isSpell })], resolve: fiveLess }),
  ],
});
