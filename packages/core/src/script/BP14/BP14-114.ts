// BP14-114 Ogre Weaponmaster — Neutral follower, 6, 6/6. 巨人.
// {[fanfare]} Choose 1. (1) Select an enemy follower on the field and deal it 6 damage. (2) Deal 3 damage to each
// enemy follower on the field. ((1) needs a target — ruling.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      modes: [
        {
          id: "one",
          label: "(1) 6 damage to an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 6);
          },
        },
        {
          id: "all",
          label: "(2) 3 damage to each enemy follower",
          *resolve(fx) {
            yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 3);
          },
        },
      ],
    }),
  ],
});
