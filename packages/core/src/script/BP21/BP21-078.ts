// BP21-078 Arka, Sin Spinner (Evolved) — 3/3.
// Whenever you roll a 6-sided die, select an enemy follower on the field and deal it 1 damage. If you roll a 6, deal it 3
// damage instead.
// On Evolve - Do the following 2 times. "Roll a 6-sided die." (Triggers once per roll, each with its own result — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { arkaSpin, rollDice } from "./shared-abyss";

export default defineCard({
  abilities: [
    arkaSpin,
    onEvolve({
      *resolve(fx) {
        yield* rollDice(fx, 2);
      },
    }),
  ],
});
