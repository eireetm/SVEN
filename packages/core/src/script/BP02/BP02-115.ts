// BP02-115 Gourmet Emperor Khaiza — Neutral follower, 3, 3/3.
// {[fanfare]} Select an enemy follower that costs 2 play points or less on the field. Destroy it and
// give its leader {[defense]}+3. (Printed cost — ruling; CR 2.5.1.)
import { defineCard, fanfare } from "../helpers";
import { costAtMost, enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower({ filter: costAtMost(2) })],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const owner = fx.game.controller(target);
        yield* fx.destroy([target]);
        yield* fx.giveLeaderDefense(owner, 3);
      },
    }),
  ],
});
