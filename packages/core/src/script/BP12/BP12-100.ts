// BP12-100 Fortune Fowl — Havencraft follower, 3, 4/1. 鳥族.
// Rush.
// {[lastwords]} {[cost01]} Summon a Holy Falcon token. (An optional cost, CR 10.4.7.4.)
import { defineCard, lastWords } from "../helpers";
import { playPointsCost } from "../costs";
import { HOLY_FALCON } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    lastWords({
      cost: playPointsCost(1),
      *resolve(fx) {
        yield* fx.summon([HOLY_FALCON]);
      },
    }),
  ],
});
