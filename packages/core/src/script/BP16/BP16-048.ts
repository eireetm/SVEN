// BP16-048 Ms. Miranda, Adored Academic — Runecraft follower, 2, 2/2. 魔法使い・学院.
// {[fanfare]} Discard an Academic card: Draw 2 cards.
import { discardA } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { academic } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: discardA(academic),
      *resolve(fx) {
        yield* fx.draw(2);
      },
    }),
  ],
});
