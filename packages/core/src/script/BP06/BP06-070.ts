// BP06-070 Trident Merman — Dragoncraft follower, 5, 4/4. 海洋.
// {[fanfare]} Summon 2 Megalorca tokens.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Megalorca", "Megalorca"]);
      },
    }),
  ],
});
