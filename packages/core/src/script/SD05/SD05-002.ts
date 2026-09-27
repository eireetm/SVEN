// SD05-002 Alucard — Abysscraft follower, 7, 4/4. 吸血鬼.
// Storm.
// {[fanfare]}, Necrocharge (10): Give this follower {[attack]}+2.
// Strike: Select an enemy follower on the field. Deal it 4 damage and give your leader {[defense]}+4. (Not played without an enemy
// follower to select: no defense either — ruling.)
import { defineCard, fanfare, strike } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    fanfare({
      *resolve(fx) {
        if (fx.game.necrocharge(fx.controller, 10)) yield* fx.giveStats(fx.self, 2, 0);
      },
    }),
    strike({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        yield* fx.giveLeaderDefense(fx.controller, 4);
      },
    }),
  ],
});
