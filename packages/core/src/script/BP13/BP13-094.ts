// BP13-094 Westmuenster Abbey — Havencraft amulet, 3. 信仰・獣.
// During your turn, whenever a follower that costs 2 or less is put onto your field, select an enemy leader
// or enemy follower on the field and deal it 1 damage. (元のコスト; once per follower — ruling.)
import { defineCard, whenFollowerEntersYourField } from "../helpers";
import { costAtMost, enemyLeaderOrFollower } from "../targets";
import { yourTurn } from "./shared";

export default defineCard({
  abilities: [
    whenFollowerEntersYourField(
      {
        triggerIf: yourTurn,
        targets: [enemyLeaderOrFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 1);
        },
      },
      { filter: costAtMost(2) },
    ),
  ],
});
