// SD06-011 Guardian Nun — Havencraft follower, 3, 3/3. 信仰.
// {[evolve]} {[cost01]}: Evolve this follower.
// Ward.
// {[fanfare]} If there is an amulet on your field, give this follower {[defense]}+1. (+1 however many — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { isAmulet } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        if (fx.game.cards(fx.controller, "field").some((id) => isAmulet(fx.game, id))) yield* fx.giveStats(fx.self, 0, 1);
      },
    }),
  ],
});
