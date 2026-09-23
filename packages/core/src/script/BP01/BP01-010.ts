// BP01-010 Elven Princess Mage (Evolved) — 4/4.
// On Evolve: Put 2 Fairy Wisp tokens into your EX area.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.tokensToEx(["Fairy Wisp", "Fairy Wisp"]);
      },
    }),
  ],
});
