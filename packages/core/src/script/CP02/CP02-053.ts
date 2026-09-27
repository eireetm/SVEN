// CP02-053 Yui Ohtsuki — Dragoncraft follower, 4, 3/3. デレマス・パッション.
// {[evolve]} {[cost02]}: Evolve this follower.
// {[fanfare]}, Lesson (1): Select an enemy follower on the field and deal it 4 damage. (A cost of the Fanfare, CR 10.4.7.4,
// 14.3.2.1.)
import { lesson } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      cost: lesson(1),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
  ],
});
