// BP01-068 Crafty Warlock — Runecraft follower, 2, 2/2.
// {[evolve]}{[cost01]}: Evolve this follower. // {[lastwords]} Summon a Magic Sediment token.
import { defineCard, evolveAbility, lastWords } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    lastWords({
      *resolve(fx) {
        yield* fx.summon(["Magic Sediment"]);
      },
    }),
  ],
});
