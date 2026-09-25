// BP06-071 Dragon Chef — Dragoncraft follower, 3, 3/4. 竜族・コック.
// {[fanfare]} Give your leader {[defense]}+2. If there's an amulet on your field, give
// {[defense]}+4 instead.
import { defineCard, fanfare } from "../helpers";
import { isAmulet } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const amulet = fx.game.cards(fx.controller, "field").some((id) => isAmulet(fx.game, id));
        yield* fx.giveLeaderDefense(fx.controller, amulet ? 4 : 2);
      },
    }),
  ],
});
