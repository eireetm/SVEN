// BP01-075 Teachings of Creation — Runecraft amulet, 1. Stack.
// {[fanfare]} Draw a card.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["stack"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
