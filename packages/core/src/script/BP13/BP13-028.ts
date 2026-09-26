// BP13-028 Jeno, Fanged Tyrant — Swordcraft follower, 4, 4/3. 兵士・レヴィオン・獣・キラー.
// When playing this card, bury a Levin follower that costs 3 or less: This card costs 3 less to play. (CR
// 10.4.7.3; a follower on your field, 元のコスト — so a full field can still play it, like BP07-004.)
// ----------
// {[fanfare]} Select an enemy follower on the field and deal it 4 damage.
import { defineCard, fanfare } from "../helpers";
import { buryFromYourField } from "../costs";
import { and, costAtMost, enemyFollower, isFollower } from "../targets";
import { levin } from "./shared";

export default defineCard({
  playOptions: [
    {
      id: "bury",
      label: "Bury a Levin follower that costs 3 or less: costs 3 less",
      ...buryFromYourField(and(isFollower, levin, costAtMost(3)), 1),
      freesFieldSlots: 1,
      costDelta: -3,
    },
  ],
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
  ],
});
