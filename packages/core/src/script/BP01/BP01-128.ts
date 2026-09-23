// BP01-128 Jeanne d'Arc (Evolved) — 4/5.
// On Evolve: Deal 2 damage to each enemy follower on the field. Give each other follower on your
// field +2 defense.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 2);
        for (const id of fx.game.followers(fx.controller)) if (id !== fx.self) yield* fx.giveStats(id, 0, 2);
      },
    }),
  ],
});
