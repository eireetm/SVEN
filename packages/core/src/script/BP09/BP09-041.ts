// BP09-041 Absolute Zeroblade — Runecraft spell, 1. 魔法使い.
// Deal 1 damage to each enemy follower on the field. Spellchain (10) - Deal 1 damage again. SC (15) -
// Deal 1 damage again. (Three separate damages with 15 — "whenever this takes damage" triggers three
// times — rulings. This spell is not in the cemetery yet, CR 13.3.1.)
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const opp = fx.game.opponent(fx.controller);
        yield* fx.dealDamageEach(fx.game.followers(opp), 1);
        if (fx.game.spellchain(fx.controller, 10)) yield* fx.dealDamageEach(fx.game.followers(opp), 1);
        if (fx.game.spellchain(fx.controller, 15)) yield* fx.dealDamageEach(fx.game.followers(opp), 1);
      },
    }),
  ],
});
