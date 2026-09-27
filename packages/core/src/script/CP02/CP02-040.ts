// CP02-040 Kanade Hayami (Evolved) — 4/4.
// On Evolve - Lesson (2): Select an enemy follower on the field and deal it 4 damage. (A cost of the ability, CR 10.4.7.4,
// 14.3.2.1.)
import { lesson } from "../costs";
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      cost: lesson(2),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
  ],
});
