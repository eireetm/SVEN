// BP12-069 Neun, Daybreak Vampire — Abysscraft follower, 3, 3/3. 機械・吸血鬼.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Summon an Assembly Droid or Forest Bat token. Put an Assembly Droid or Forest Bat token into
// your EX area.
import type { EffectContext } from "../../engine/effects/context";
import type { Proc } from "../../engine/runtime/proc";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { DROID } from "./shared";

/** "An Assembly Droid or Forest Bat token": the player chooses which. */
function* droidOrBat(fx: EffectContext): Proc<string> {
  const [pick] = yield* fx.choose([
    { id: "droid", label: "Assembly Droid" },
    { id: "bat", label: "Forest Bat" },
  ]);
  return pick === "bat" ? "Forest Bat" : DROID;
}

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.summon([yield* droidOrBat(fx)]);
        yield* fx.tokensToEx([yield* droidOrBat(fx)]);
      },
    }),
  ],
});
