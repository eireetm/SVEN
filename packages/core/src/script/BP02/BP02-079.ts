// BP02-079 Veight, Vampire Noble (Evolved) — 3/3.
// On Evolve: Put a Forest Bat token into your EX area.
// Strike: Summon a Forest Bat token.
import { defineCard, onEvolve, strike } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.tokensToEx(["Forest Bat"]);
      },
    }),
    strike({
      *resolve(fx) {
        yield* fx.summon(["Forest Bat"]);
      },
    }),
  ],
});
