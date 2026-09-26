// BP21-091 Verdilia, Rogue Professor — Havencraft follower, 1, 1/1. 先導・学院.
// {[evolve]} {[cost01]}: Evolve this.
// Ward.
// {[fanfare]} Select an enemy follower on the field and, if this was put onto the field by an ability, deal it 2 damage.
// (On the opponent's turn too — ruling.)
import { defineCard, enteredByAbility, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (enteredByAbility(fx)) yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
