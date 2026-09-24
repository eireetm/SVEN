// BP03-120 Harbinger of the Night (Evolved) — Neutral, 3/3.
// On Evolve: Deal 1 to the enemy leader.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 1);
      },
    }),
  ],
});
