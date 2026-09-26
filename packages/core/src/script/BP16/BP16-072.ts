// BP16-072 Silvercloud Dragonrider — Dragoncraft follower, 7, 5/6. 竜使い.
// When this is discarded, {[cost02]}: Summon a Dragon token. (Also at the hand limit — ruling; CR 10.4.7.4.)
// ----------
// Ward.
// {[fanfare]} Summon a Dragon token.
import { playPointsCost } from "../costs";
import { defineCard, fanfare, whenDiscarded } from "../helpers";
import { DRAGON } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    whenDiscarded({
      cost: playPointsCost(2),
      *resolve(fx) {
        yield* fx.summon([DRAGON]);
      },
    }),
    fanfare({
      *resolve(fx) {
        yield* fx.summon([DRAGON]);
      },
    }),
  ],
});
