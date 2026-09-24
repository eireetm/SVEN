// BP04-039 Wordwielder Ginger (Evolved) — Runecraft, 6/6.
// On Evolve: You may put any number of followers from your hand onto your field. Their Fanfare
// abilities can't be performed. For the rest of this turn, they can't attack enemies.
import { defineCard, onEvolve } from "../helpers";
import { ANY } from "../targets";
import { putFromHandQuietly } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* putFromHandQuietly(fx, ANY);
      },
    }),
  ],
});
