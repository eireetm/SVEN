// BP08-100 Temple Windbear (Evolved) — Havencraft follower, 2/3. 信仰・獣.
// On Evolve: summon a Holy Tiger; if at least 2 amulets are on your field, draw a card. CR 5.5, 5.10.
import { defineCard, onEvolve } from "../helpers";
import { isAmulet } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon(["Holy Tiger"]);
        if (fx.game.cards(fx.controller, "field").filter((id) => isAmulet(fx.game, id)).length >= 2) yield* fx.draw(1);
      },
    }),
  ],
});
