// BP01-037 Sage Commander — Swordcraft follower, 5, 5/5.
// {[fanfare]} Give each other follower on your field +1/+1.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        for (const id of fx.game.followers(fx.controller)) if (id !== fx.self) yield* fx.giveStats(id, 1, 1);
      },
    }),
  ],
});
