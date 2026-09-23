// BP01-086 Shenlong — Dragoncraft follower, 5, 4/5.
// {[evolve]}{[cost02]}: Evolve this follower. // Ward.
// {[fanfare]} Draw 2 cards, then discard a card.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        yield* fx.draw(2);
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
  ],
});
