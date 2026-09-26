// BP08-064 Righteous Dragoon — Dragoncraft follower, 3, 3/4. 竜使い.
// {[fanfare]} During Overflow, choose: deal 4 to a selected enemy follower; or deal 2 to every
// enemy follower. The first mode is unavailable without a legal target (ruling, CR 5.18.3.1.2,
// 13.4).
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      condition: (g, c) => g.overflow(c),
      modes: [
        {
          id: "four",
          label: "Deal 4 damage to an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 4);
          },
        },
        {
          id: "all",
          label: "Deal 2 damage to each enemy follower",
          *resolve(fx) {
            yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 2);
          },
        },
      ],
    }),
  ],
});
