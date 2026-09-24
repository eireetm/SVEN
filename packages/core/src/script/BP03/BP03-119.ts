// BP03-119 Harbinger of the Night — Neutral follower, 2, 2/2. 堕天使.
// {[evolve]} {[cost01]}: Evolve.
// {[fanfare]} Deal 1 to an enemy follower.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 1);
      },
    }),
  ],
});
