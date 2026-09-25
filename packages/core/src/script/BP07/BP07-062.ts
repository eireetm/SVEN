// BP07-062 Whirlwind Pteranodon — Dragoncraft follower, 3, 3/2. 自然・竜族.
// {[fanfare]} Banish a Naterran Great Tree from your field: Increase your max play points by 1.
// {[lastwords]} Put a Naterran Great Tree token onto your field.
import { banishFromYour } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { isTree, summonTreeLastWords } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: banishFromYour(["field"], isTree),
      *resolve(fx) {
        yield* fx.increaseMaxPlayPoints(1);
      },
    }),
    summonTreeLastWords,
  ],
});
