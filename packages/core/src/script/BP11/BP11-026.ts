// BP11-026 Stalwart Slinger (Evolved) — Swordcraft follower, 4/4. 兵士.
// Assail.
// On Evolve - Deal 3 damage to each enemy leader.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  keywords: ["assail"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 3);
      },
    }),
  ],
});
