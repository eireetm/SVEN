// ECP02-017 Airi Totoki [Cinderella Girl] — Swordcraft follower, 2, 2/2. デレマス・パッション.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} {[cost01]}, Lesson (1), discard a Passion card: Select an enemy follower on the field and deal it 3 damage.
import { allCosts, discardA, lesson, playPointsCost } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { passion } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      cost: allCosts(playPointsCost(1), lesson(1), discardA(passion)),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
  ],
});
