// BP19-032 Felpurr Maid — Swordcraft follower, 3, 2/2. メイド・獣.
// {[evolve]} {[cost01]}: Evolve this.
// Storm.
// Strike - Draw a card.
import { defineCard, evolveAbility, strike } from "../helpers";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    evolveAbility(1),
    strike({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
