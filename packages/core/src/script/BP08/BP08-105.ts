// BP08-105 Sylvia, the Condemner — Neutral follower, 7, 6/6. 超克.
// Fanfare: destroy an enemy follower and deal 5 to its leader. In hand, Activate (2), discard this:
// destroy an enemy follower costing at least 5 (evolved followers keep base cost, ruling; CR 5.16.1.2).
import { discardThis } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { costAtLeast, enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.destroy([target]);
        yield* fx.dealDamage(leader, 5);
      },
    }),
    activated(
      { playPoints: 2, custom: discardThis },
      {
        validIn: ["hand"],
        targets: [enemyFollower({ filter: costAtLeast(5) })],
        *resolve(fx) { yield* fx.destroy(fx.targets[0] ?? []); },
      },
    ),
  ],
});
