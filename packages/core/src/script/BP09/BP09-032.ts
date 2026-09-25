// BP09-032 Savage Swordsman — Swordcraft follower, 1, 2/2. 兵士.
// {[fanfare]} If there's a token follower on your field, give this follower {[attack]}+1/{[defense]}+1.
import { defineCard, fanfare } from "../helpers";
import { isToken } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const token = fx.game.followers(fx.controller).some((id) => isToken(fx.game, id));
        if (token && fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
  ],
});
