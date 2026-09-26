// BP08-047 Zealot of Truth — Runecraft follower, 3, 2/4. 絶傑・魔法使い・キラー.
// Storm.
// {[fanfare]} If there at least 5 Mage cards in your cemetery, give this follower {[attack]}
// +1/{[defense]}+1.
import { defineCard, fanfare } from "../helpers";
import { hasTrait } from "../targets";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    fanfare({
      condition: (g, p) => g.cards(p, "cemetery").filter((id) => hasTrait("魔法使い")(g, id)).length >= 5,
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
  ],
});
