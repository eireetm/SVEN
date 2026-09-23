// BP01-159 Bellringer Angel — Neutral follower, 1, 0/2.
// {[evolve]}{[cost02]}: Evolve this follower. // Ward. // {[lastwords]} Draw a card.
import { defineCard, evolveAbility, lastWords } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(2),
    lastWords({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
