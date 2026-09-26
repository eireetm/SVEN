// BP10-119 Pureshot Angel — Neutral follower, 5, 5/5. 天使.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Select an enemy follower on the field and deal it 3 damage.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
  ],
});
