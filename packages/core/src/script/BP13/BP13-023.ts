// BP13-023 Sera, Maiden of the Dawn (Evolved) — Swordcraft follower, 5/4. 指揮官.
// Your token followers don't take ability damage. (Every damage but combat damage to followers and
// attack damage to leaders — ruling.)
// During your turn, whenever an Officer follower is put onto your field, give your leader {[defense]}+1.
// On Evolve - Summon 3 Shield Guardian tokens.
import { defineCard, onEvolve } from "../helpers";
import { officerEnters, tokensTakeNoAbilityDamage } from "./shared-sword";

export default defineCard({
  field: tokensTakeNoAbilityDamage,
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon(["Shield Guardian", "Shield Guardian", "Shield Guardian"]);
      },
    }),
    officerEnters,
  ],
});
