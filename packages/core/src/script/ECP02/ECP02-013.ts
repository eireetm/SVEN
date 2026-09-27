// ECP02-013 Mio Honda [Cinderella Girl] — Swordcraft follower, 2, 2/2. デレマス・パッション.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]}, Lesson (1): Draw a card. Discard a card.
import { lesson } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      cost: lesson(1),
      *resolve(fx) {
        yield* fx.draw(1);
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
  ],
});
