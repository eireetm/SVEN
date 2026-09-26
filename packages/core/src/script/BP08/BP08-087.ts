// BP08-087 Godsworn Alexiel — Havencraft follower, 7, 4/4. 信仰・光輝.
// Evolve (1). Ward. Fanfare: give your leader +2 defense per amulet on your field. CR 5.27, 12.2.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { isAmulet } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        const x = fx.game.cards(fx.controller, "field").filter((id) => isAmulet(fx.game, id)).length * 2;
        yield* fx.giveLeaderDefense(fx.controller, x);
      },
    }),
  ],
});
