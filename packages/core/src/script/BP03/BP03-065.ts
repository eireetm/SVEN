// BP03-065 Hammer Dragonewt (Evolved) — Dragoncraft, 3/3.
// On Evolve: Deal 2 to the enemy leader.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
      },
    }),
  ],
});
