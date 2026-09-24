// BP03-034 Bladed Hedgehog — Swordcraft follower, 2, 1/3. 獣・童話.
// {[evolve]} {[cost02]}: Evolve.
// During your turn, whenever an enemy follower is destroyed, +1 attack.
import { defineCard, evolveAbility, whenEnemyFollowerDestroyed } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(2),
    whenEnemyFollowerDestroyed({
      condition: (g, p) => g.activePlayer === p,
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 0);
      },
    }),
  ],
});
