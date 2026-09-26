// BP17-013 Blossom Treant — Forestcraft follower, 4, 3/6. 精霊.
// {[evolve]} {[cost03]}: Evolve this.
// Ward.
// {[lastwords]} Draw a card.
import { defineCard, evolveAbility, lastWords } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(3),
    lastWords({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
