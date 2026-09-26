// BP14-028 War Hero — Swordcraft follower, 5, 4/4. 兵士.
// {[fanfare]} Select an enemy follower on the field. Deal it 4 damage and draw a card. (Not played without a
// target — ruling.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        yield* fx.draw(1);
      },
    }),
  ],
});
