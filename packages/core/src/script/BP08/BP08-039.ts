// BP08-039 Unbodied Witch (Evolved) — Runecraft follower, 7/7. 魔法生物・禁忌.
// On Evolve - Put each other card on the field into its owner's cemetery. (Not destruction, so "can't
// be destroyed by abilities" doesn't stop it — ruling, CR 5.6.)
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const field = [...fx.game.cards(fx.controller, "field"), ...fx.game.cards(fx.game.opponent(fx.controller), "field")];
        yield* fx.bury(field.filter((id) => id !== fx.self));
      },
    }),
  ],
});
