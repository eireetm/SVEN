// BP08-029 Phantom Assassin — Swordcraft follower, 1, 2/2. 暗殺者.
// Fanfare: with at least 2 Assassin followers in your cemetery, this gets +1/+1 and Bane.
// CR 10.7.3.2, 12.12.
import { defineCard, fanfare } from "../helpers";
import { hasTrait, isFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      condition: (g, p) => g.cards(p, "cemetery").filter((id) => isFollower(g, id) && hasTrait("暗殺者")(g, id)).length >= 2,
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 1, 1);
        yield* fx.giveKeyword(fx.self, "bane");
      },
    }),
  ],
});
