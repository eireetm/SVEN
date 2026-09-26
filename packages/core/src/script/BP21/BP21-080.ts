// BP21-080 Bad-Girl Life — Abysscraft spell, 1. 魔界・学院.
// Draw a card. Do the following 2 times. "Roll a 6-sided die." (CR 5.20.)
import { defineCard, spell } from "../helpers";
import { rollDice } from "./shared-abyss";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.draw(1);
        yield* rollDice(fx, 2);
      },
    }),
  ],
});
