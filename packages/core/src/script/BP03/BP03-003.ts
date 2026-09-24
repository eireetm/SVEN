// BP03-003 Cosmos Fang (Evolved) — Forestcraft, 5/5.
// On Evolve: Select an enemy follower. Return it to its owner's hand. If it is evolved, destroy it instead.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower, isEvolved } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const id = fx.targets[0]![0]!;
        if (isEvolved(fx.game, id)) yield* fx.destroy([id]);
        else yield* fx.returnToHand([id]);
      },
    }),
  ],
});
