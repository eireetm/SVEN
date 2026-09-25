// BP06-012 Greenwood Guardian — Forestcraft follower, 2, 3/2. 狩人.
// Ward.
// {[fanfare]} Bury the top card of your deck. Then, if there are at least 3 Hunter cards in your
// cemetery, give this follower {[defense]}+1.
import { defineCard, fanfare } from "../helpers";
import { threeHunters } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.mill(1);
        if (threeHunters(fx.game, fx.controller)) yield* fx.giveStats(fx.self, 0, 1);
      },
    }),
  ],
});
