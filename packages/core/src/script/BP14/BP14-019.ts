// BP14-019 Taketsumi, Creator of Paradise — Swordcraft advanced follower, 4, 5/6. 宴楽・指揮官.
// {[fanfare]} Summon 2 Sootspawn tokens.
// Activate {[engage]}: Select an enemy follower on the field. Deal 5 damage to it and 3 damage to its leader.
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Sootspawn", "Sootspawn"]);
      },
    }),
    activated(
      { engageSelf: true },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          yield* fx.dealDamages([
            { target, amount: 5 },
            { target: fx.game.leader(fx.game.controller(target)), amount: 3 },
          ]);
        },
      },
    ),
  ],
});
