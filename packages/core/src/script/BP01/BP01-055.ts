// BP01-055 Ancient Alchemist (Evolved) — 3/6.
// While this card is on your field, your Golem followers cost 1 less to play. (Two of them: -2
// — ruling.)
// Whenever a Golem follower is put onto your field, select an enemy leader or enemy follower on
// the field and deal it 3 damage.
import { defineCard, whenFollowerEntersYourField } from "../helpers";
import { and, enemyLeaderOrFollower, hasTrait, isFollower } from "../targets";

const golemFollower = and(isFollower, hasTrait("ゴーレム"));

export default defineCard({
  field: {
    playCostOf: (g, self, card, player) => (player === g.controller(self) && golemFollower(g, card) ? -1 : 0),
  },
  abilities: [
    whenFollowerEntersYourField(
      {
        targets: [enemyLeaderOrFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        },
      },
      { filter: golemFollower },
    ),
  ],
});
