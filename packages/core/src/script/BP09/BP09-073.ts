// BP09-073 Oldblood King (Evolved) — Abysscraft follower, 3/5. 吸血鬼.
// On Evolve - Give each Forest Bat on your field {[attack]}+1.
// While this card is on your field, each Forest Bat on your field has Rush and Assail.
import { defineCard, onEvolve } from "../helpers";
import { forestBat, forestBatsRushAssail } from "./shared";

export default defineCard({
  field: { keywordsFor: forestBatsRushAssail },
  abilities: [
    onEvolve({
      *resolve(fx) {
        for (const id of fx.game.followers(fx.controller).filter((bat) => forestBat(fx.game, bat))) yield* fx.giveStats(id, 1, 0);
      },
    }),
  ],
});
