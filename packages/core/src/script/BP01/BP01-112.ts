// BP01-112 Dark Summoner — Abysscraft follower, 2, 3/2.
// {[fanfare]} If Sanguine is active for you, give this follower +1/+1 and Rush. (CR 13.5.2.2)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        if (!fx.game.sanguine(fx.controller)) return;
        yield* fx.giveStats(fx.self, 1, 1);
        yield* fx.giveKeyword(fx.self, "rush");
      },
    }),
  ],
});
