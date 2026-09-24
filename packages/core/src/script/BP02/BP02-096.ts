// BP02-096 Radiance Angel — Havencraft follower, 4, 3/4.
// {[evolve]}{[cost01]}: Evolve this follower. // Ward.
// {[fanfare]} Draw a card.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
