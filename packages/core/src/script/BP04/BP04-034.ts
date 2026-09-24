// BP04-034 Pollux — Swordcraft follower, 4, 5/5. 兵士・星神.
// {[fanfare]} If there is a non-Swordcraft follower on your field, give this follower +1/+1 and
// Rush.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        if (!fx.game.followers(fx.controller).some((id) => fx.game.info(id).class !== "Swordcraft")) return;
        yield* fx.giveStats(fx.self, 1, 1);
        yield* fx.giveKeyword(fx.self, "rush");
      },
    }),
  ],
});
