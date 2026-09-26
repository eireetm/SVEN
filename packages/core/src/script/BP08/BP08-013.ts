// BP08-013 Insane Dark Elf — Forestcraft follower, 4, 4/4. エルフ族・キラー.
// {[evolve]} {[cost01]}: Evolve this follower.
// Strike - Put a Fairy Wisp token in your EX area.
import { defineCard, evolveAbility, strike } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    strike({
      *resolve(fx) {
        yield* fx.tokensToEx(["Fairy Wisp"]);
      },
    }),
  ],
});
