// BP17-055 Rowen, Dragon Lance — Dragoncraft follower, 3, 4/2. 竜族・武闘竜人・キラー.
// Rush. Assail.
// {[fanfare]} Put a Curse of the Black Dragon token into your EX area.
// Strike - Select an enemy follower on the field. Deal it 2 damage and, if Overflow is active for you, deal 1 damage to
// its leader.
// {[act]} {[cost04]}: Select an enemy follower on the field. Deal 3 damage to it and 1 damage to its leader.
import { activated, defineCard, fanfare, strike } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["rush", "assail"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Curse of the Black Dragon"]);
      },
    }),
    strike({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.dealDamage(target, 2);
        if (fx.game.overflow(fx.controller)) yield* fx.dealDamage(leader, 1);
      },
    }),
    activated(
      { playPoints: 4 },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          yield* fx.dealDamages([
            { target, amount: 3 },
            { target: fx.game.leader(fx.game.controller(target)), amount: 1 },
          ]);
        },
      },
    ),
  ],
});
