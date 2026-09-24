// BP03-035 Bladed Hedgehog (Evolved) — Swordcraft, 2/4.
// On Evolve: Deal 2 to an enemy follower.
// During your turn, whenever an enemy follower is destroyed, +1 attack.
import { defineCard, onEvolve, whenEnemyFollowerDestroyed } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
    whenEnemyFollowerDestroyed({
      condition: (g, p) => g.activePlayer === p,
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 0);
      },
    }),
  ],
});
