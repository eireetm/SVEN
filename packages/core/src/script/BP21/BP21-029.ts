// BP21-029 Deadeye Trainee — Swordcraft follower, 2, 3/2. 兵士・学院.
// Ward.
// {[fanfare]} Select an enemy follower on the field. If this was put onto the field by an ability, destroy it and deal 1
// damage to its leader. (On the opponent's turn too — ruling.)
import { defineCard, enteredByAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (!enteredByAbility(fx)) return;
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.destroy([target]);
        yield* fx.dealDamage(leader, 1);
      },
    }),
  ],
});
