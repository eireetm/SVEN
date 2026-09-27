// CP03-040 Knight of Truth, Gordon — Swordcraft spell, 2. ヴァンガード・ロイヤルパラディン.
// {[quick]}
// Choose one. (1) Select an enemy follower on the field and deal it 3 damage. (2) The next time your leader would take damage
// this turn, it takes that much minus 5 instead. (Two of them make it -10; one used up by damage reduced to 0 keeps the other;
// "defense becomes 10" isn't damage; an attack with 0 attack deals none — rulings.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      modes: [
        {
          id: "1",
          label: "Deal 3 damage to an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 3);
          },
        },
        {
          id: "2",
          label: "Your leader's next damage this turn is 5 less",
          *resolve(fx) {
            yield* fx.reduceNextDamage(fx.game.leader(fx.controller), 5, "endOfTurn");
          },
        },
      ],
    }),
  ],
});
