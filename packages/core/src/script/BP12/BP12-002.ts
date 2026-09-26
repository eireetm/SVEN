// BP12-002 Elf Queen of Abundant Life — Forestcraft follower, 2, 1/2. エルフ族.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]}, Combo (3) - Draw a card.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      condition: (g, p) => g.combo(p, 3),
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
