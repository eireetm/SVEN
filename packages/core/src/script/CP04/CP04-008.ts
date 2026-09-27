// CP04-008 Makoto — Forestcraft follower, 2, 3/2. プリコネ・カォン.
// {[ub]}{[fanfare]} {[engage]} 3 cards on your field: Select an enemy follower on the field. Deal 4 damage to it and 2 damage to its
// leader. (Any 3 reserved cards, this one included, CR 10.4.6. Not paying it, or without an enemy follower, it isn't executed —
// ruling.)
import { engageYourCards } from "../costs";
import { defineCard, fanfare, ub } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    ub(
      fanfare({
        cost: engageYourCards(() => true, 3),
        targets: [enemyFollower()],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          const leader = fx.game.leader(fx.game.controller(target));
          yield* fx.dealDamages([
            { target, amount: 4 },
            { target: leader, amount: 2 },
          ]);
        },
      }),
    ),
  ],
});
