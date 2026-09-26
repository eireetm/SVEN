// BP11-047 Crystal Fencer (Evolved) — Runecraft follower, 4/4. 魔法使い.
// On Evolve - You may put a {[runecraft]} spell from your hand into your EX area. It costs 3 less to
// play this turn. (Applied after its own cost changes — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { and, inYourZone, isClass, isSpell } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [inYourZone("hand", { filter: and(isSpell, isClass("Runecraft")) })],
      *resolve(fx) {
        for (const card of yield* fx.putIntoEx(fx.targets[0]!)) yield* fx.changePlayCost(card, -3, "endOfTurn");
      },
    }),
  ],
});
