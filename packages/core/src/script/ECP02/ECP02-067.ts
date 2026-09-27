// ECP02-067 Kotoka Saionji [Pure Euphoria] — Havencraft follower, 5, 4/4. デレマス・キュート.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]}, Lesson (2): Select an enemy follower on the field and banish it.
import { lesson } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      cost: lesson(2),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.banish(fx.targets[0]!);
      },
    }),
  ],
});
