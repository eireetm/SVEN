// BP20-069 Snowstorm Dragonewt (Evolved) — 5/5.
// On Evolve - Destroy each enemy follower on the field that took damage this turn. (CR 5.14: damage more than 0.)
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const damaged = fx.game.followers(fx.game.opponent(fx.controller)).filter((id) => fx.game.tookDamageThisTurn(id));
        if (damaged.length > 0) yield* fx.destroy(damaged);
      },
    }),
  ],
});
