// BP14-045 Tempestuous Alchemist — Runecraft follower, 3, 3/3. 錬金術師.
// {[fanfare]} Select an enemy follower on the field. Deal it 3 damage and add 1 to a Stack on your field. (With
// no Stack card, a Magic Sediment with 1 counter is summoned — ruling; not played without a target.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        yield* fx.addToStack(1);
      },
    }),
  ],
});
