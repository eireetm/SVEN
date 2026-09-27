// SD01-011 Water Fairy — Forestcraft follower, 1, 1/1. 妖精.
// {[evolve]} {[cost02]}: Evolve this follower.
// {[lastwords]} Put a Fairy token into your EX area.
import { defineCard, evolveAbility, lastWords } from "../helpers";
import { FAIRY } from "../BP13/shared";

export default defineCard({
  abilities: [
    evolveAbility(2),
    lastWords({
      *resolve(fx) {
        yield* fx.tokensToEx([FAIRY]);
      },
    }),
  ],
});
