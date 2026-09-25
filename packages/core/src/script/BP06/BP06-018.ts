// BP06-018 Kagemitsu, Matchless Blade — Swordcraft follower, 1, 1/1. 挑戦者・兵士.
// Rush.
// {[fanfare]} Give this follower {[attack]}+X/{[defense]}+X, where X equals the number of faceup
// evolved followers in your evolve deck. If X is at least 3, give it Assail. If X is at least 7,
// give it "Strike - Refresh this follower. Perform only once per turn." (Faceup evolved amulets
// don't count — ruling.)
import { defineCard, fanfare } from "../helpers";
import { faceUpEvolvedFollowers } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      *resolve(fx) {
        const x = faceUpEvolvedFollowers(fx.game, fx.controller).length;
        yield* fx.giveStats(fx.self, x, x);
        if (x >= 3) yield* fx.giveKeyword(fx.self, "assail");
        if (x >= 7) yield* fx.grant(fx.self, "strikeRefreshOnce");
      },
    }),
  ],
});
