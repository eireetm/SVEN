// BP03-029 Mach Knight (Evolved) — Swordcraft, 4/4.
// On Evolve: Deal 2 to an enemy follower, or 4 if at least 2 Heroic cards are in your cemetery.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower, hasTrait } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const heroic = fx.game.cards(fx.controller, "cemetery").filter((id) => hasTrait("ヒーロー")(fx.game, id)).length;
        yield* fx.dealDamage(fx.targets[0]![0]!, heroic >= 2 ? 4 : 2);
      },
    }),
  ],
});
