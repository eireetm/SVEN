// BP01-143 Sister Initiate — Havencraft follower, 2, 3/2.
// {[fanfare]} If there is an amulet on your field, give your leader +2 defense.
import { defineCard, fanfare } from "../helpers";
import { isAmulet } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        if (fx.game.cards(fx.controller, "field").some((id) => isAmulet(fx.game, id))) {
          yield* fx.giveLeaderDefense(fx.controller, 2);
        }
      },
    }),
  ],
});
