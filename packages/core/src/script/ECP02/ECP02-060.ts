// ECP02-060 Nana Abe [Cinderella Girl] — Havencraft follower, 2, 2/2. デレマス・キュート.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]}, Lesson (1): Select an enemy follower on the field and give it {[attack]}-1/{[defense]}-1. (Attack may go below 0 —
// ruling.)
import { lesson } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      cost: lesson(1),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, -1, -1);
      },
    }),
  ],
});
