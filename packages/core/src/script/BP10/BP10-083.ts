// BP10-083 Ghost Maid (Evolved) — Abysscraft follower, 3/3. 死者・メイド.
// On Evolve - Put a Ghost token into your EX area. Bury the top card of your deck.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.tokensToEx(["Ghost"]);
        yield* fx.mill(1);
      },
    }),
  ],
});
