// BP19-035 Heavy Warrior — Swordcraft follower, 5, 5/5. 兵士.
// Ward.
// {[fanfare]} Select an enemy follower on the field and deal it and its leader 3 damage.
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.dealDamageEach([target, fx.game.leader(fx.game.controller(target))], 3);
      },
    }),
  ],
});
