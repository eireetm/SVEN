// BP02-078 Veight, Vampire Noble — Abysscraft follower, 2, 2/2.
// {[evolve]}{[cost01]}: Evolve this follower.
// Strike: Summon a Forest Bat token.
import { defineCard, evolveAbility, strike } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    strike({
      *resolve(fx) {
        yield* fx.summon(["Forest Bat"]);
      },
    }),
  ],
});
