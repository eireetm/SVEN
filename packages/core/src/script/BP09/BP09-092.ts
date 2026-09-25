// BP09-092 Tenko's Shrine — Havencraft amulet, 4. 信仰・獣.
// Whenever your leader gains defense, {[engage]}: Select an enemy leader or enemy follower on the field
// and deal it 2 damage. (CR 10.4.7.4: engage this card as the ability resolves, if it is reserved; also
// in the opponent's turn — ruling.)
import { engageThis } from "../costs";
import { defineCard, whenYourLeaderGainsDefense } from "../helpers";
import { enemyLeaderOrFollower } from "../targets";

export default defineCard({
  abilities: [
    whenYourLeaderGainsDefense({
      cost: engageThis,
      targets: [enemyLeaderOrFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
