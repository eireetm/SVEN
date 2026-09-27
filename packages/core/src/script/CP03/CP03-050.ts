// CP03-050 Starlight Melody Tamer, Farah — Runecraft follower, 3, 3/3. ヴァンガード・ペイルムーン.
// {[ride]} {[cost01]}: Give this follower Drive. (CR 14.4.9: a Drive Point is linked; once per card per game.)
// On Drive - Select up to 1 enemy follower on the field. Give this follower {[attack]}+1/{[defense]}+1 and, if there are at
// least 5 cards in your banished zone, destroy the selected follower and give your leader {[defense]}+2. (+1/+1 either way —
// ruling; the leader's +2 is under the condition too, Q10.)
import { defineCard, onDrive, rideAbility } from "../helpers";
import { enemyFollower } from "../targets";
import { countIn } from "./shared";

export default defineCard({
  abilities: [
    rideAbility(1),
    onDrive({
      targets: [enemyFollower({ upTo: true })],
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 1, 1);
        if (countIn(fx.game, fx.controller, "banished") < 5) return;
        yield* fx.destroy(fx.targets[0] ?? []);
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
