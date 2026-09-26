// BP15-111 Sacred Gavel — Havencraft amulet, 2. 信仰.
// {[fanfare]} Select an enemy follower on the field and deal it 3 damage.
// {[lastwords]} Give your leader {[defense]}+1.
import { defineCard, fanfare, lastWords } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
