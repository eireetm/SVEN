// SD05-010 Lesser Mummy — Abysscraft follower, 2, 2/2. 死者.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]}, Necrocharge (10): Give this follower Storm.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        if (fx.game.necrocharge(fx.controller, 10)) yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
  ],
});
