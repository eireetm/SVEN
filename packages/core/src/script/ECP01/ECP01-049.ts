// ECP01-049 Jungle Pocket — Havencraft follower, 2, 3/2. ウマ娘.
// {[feed]} {[cost01]}: Race this follower.
// {[fanfare]} Discard an Umamusume card: Draw a card. If you discarded an Umamusume card that costs 7 or more, draw 2 instead.
// (元のコスト.)
// Activate {[engage]}: Select an enemy follower on the field and, if there are at least 3 Umamusume cards on your field, deal it
// 2 damage. If there are 5, deal 2 damage to its leader.
import { activated, defineCard, fanfare, serveAbility } from "../helpers";
import { enemyFollower } from "../targets";
import { discardUmamusumeRecorded, discardedCostAtLeast, umamusumeOnYourField } from "./shared";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    fanfare({
      cost: discardUmamusumeRecorded,
      *resolve(fx) {
        yield* fx.draw(discardedCostAtLeast(fx, 7) ? 2 : 1);
      },
    }),
    activated(
      { engageSelf: true },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          const g = fx.game;
          const target = fx.targets[0]![0]!;
          const leader = g.leader(g.controller(target));
          if (umamusumeOnYourField(g, fx.controller) >= 3) yield* fx.dealDamage(target, 2);
          if (umamusumeOnYourField(g, fx.controller) === 5) yield* fx.dealDamage(leader, 2);
        },
      },
    ),
  ],
});
