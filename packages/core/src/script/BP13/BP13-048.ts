// BP13-048 Magical Squirrel — Runecraft follower, 2, 1/1. 魔法生物・獣.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Draw a card. Discard a card. Give your leader {[defense]}+1.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
        yield* fx.discard(fx.controller, 1, 1);
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
