// SD05-012 Lilith — Abysscraft follower, 2, 2/2. 魔界.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Put a Forest Bat token into your EX area. (Nothing with a full EX area — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { BAT } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([BAT]);
      },
    }),
  ],
});
