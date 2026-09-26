// BP08-044 Morra, Monika's Familiar — Runecraft follower, 1, 1/1. 魔法生物.
// {[fanfare]} Draw a card. Discard a card.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
  ],
});
