// CP02-090 Nana Abe (Evolved) — 4/3.
// On Evolve - You may summon an amulet that costs 3 or less from your hand. (元のコスト.)
import { defineCard, onEvolve } from "../helpers";
import { costAtMost, isAmulet } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const g = fx.game;
        const fits = g.cards(fx.controller, "hand").filter((id) => isAmulet(g, id) && costAtMost(3)(g, id));
        yield* fx.putOntoField(yield* fx.chooseCards(fits, 0, 1));
      },
    }),
  ],
});
