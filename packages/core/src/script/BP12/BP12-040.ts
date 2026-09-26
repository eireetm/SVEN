// BP12-040 Melvie, Princess Witch — Runecraft follower, 1, 1/1. 魔法使い.
// Rush.
// {[fanfare]} If there are at least 5 Mage followers in your cemetery, give this follower {[attack]}+4.
// {[fanfare]}, Spellchain (5) - Give this follower {[defense]}+4. (The two Fanfares resolve in any
// order — ruling.)
import { defineCard, fanfare } from "../helpers";
import { mageFollowersInCemetery } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      condition: (g, p) => mageFollowersInCemetery(g, p) >= 5,
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 4, 0);
      },
    }),
    fanfare({
      condition: (g, p) => g.spellchain(p, 5),
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 0, 4);
      },
    }),
  ],
});
