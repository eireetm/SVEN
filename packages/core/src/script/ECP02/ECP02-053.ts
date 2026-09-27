// ECP02-053 Chitose Kurosaki [Memento Mori] — Abysscraft follower, 3, 3/3. デレマス・キュート.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]}, Lesson (1): Select an enemy follower on the field. Deal it 1 damage and give your leader {[defense]}+1. (Not playable
// without an enemy follower to select — ruling.)
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
        yield* fx.dealDamage(fx.targets[0]![0]!, 1);
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
