// BP16-106 Ironfist Priest (Evolved) — Havencraft follower, 5/5. 信仰.
// Ward.
// On Evolve - Deal 4 damage to each enemy leader.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 4);
      },
    }),
  ],
});
