// BP04-125 Goblin Princess (Evolved) — Neutral, 3/2.
// On Evolve: Put a Goblin King token into your EX area.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.tokensToEx(["Goblin King"]);
      },
    }),
  ],
});
