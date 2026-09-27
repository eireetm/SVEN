// CP02-068 Mode Estivale — Dragoncraft spell, 4. デレマス・クール.
// Draw 3 cards.
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.draw(3);
      },
    }),
  ],
});
