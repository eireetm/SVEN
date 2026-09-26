// BP17-095 Meowskers, Fluffy Consul — Havencraft follower, 1, 1/1. 自然・光輝・獣.
// Storm.
// {[fanfare]} If this was put onto the field by an ability, draw a card. (On the opponent's turn too; BP17-103 summoning it
// counts — rulings.)
// Strike - {[cost01]}: Select an enemy follower on the field and deal it 2 damage. (CR 10.4.7.4.)
import { playPointsCost } from "../costs";
import { defineCard, enteredByAbility, fanfare, strike } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    fanfare({
      *resolve(fx) {
        if (enteredByAbility(fx)) yield* fx.draw(1);
      },
    }),
    strike({
      cost: playPointsCost(1),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
