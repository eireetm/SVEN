// BP03-061 Draconir, Knuckle Dragon (Evolved) — Dragoncraft, 4/4.
// On Evolve: Deal 2 to an enemy follower, or 4 if another Armed follower is on your field.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower, hasTrait } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const armed = fx.game.followers(fx.controller).some((id) => id !== fx.self && hasTrait("武装")(fx.game, id));
        yield* fx.dealDamage(fx.targets[0]![0]!, armed ? 4 : 2);
      },
    }),
  ],
});
