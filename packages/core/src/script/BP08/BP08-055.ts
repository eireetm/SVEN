// BP08-055 Annerose — Dragoncraft follower, 2, 2/2. ドラゴニュート・プリンセス.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} If Overflow is active, look at the top 3 cards; a Dragonewt card may be revealed and
// added to hand, and the rest go to the bottom in any order (CR 5.11, 5.21, 13.4).
import { defineCard, evolveAbility, fanfare, lookAtTopCards } from "../helpers";
import { hasTrait } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        if (fx.game.overflow(fx.controller)) {
          yield* lookAtTopCards(fx, 3, { filter: hasTrait("ドラゴニュート"), to: "hand" });
        }
      },
    }),
  ],
});
