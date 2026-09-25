// BP06-075 Aragavy the Berserker — Abysscraft follower, 3, 4/3. 挑戦者・獣.
// {[fanfare]} {[cost05]} Deal 5 damage to each other follower on the field. Give this follower
// {[attack]}+2/{[defense]}+2 and Storm.
// At the start of your end phase, if Sanguine is active for you, select an enemy leader or enemy
// follower on the field and deal it 3 damage. (CR 13.5.2)
import { atStartOfYourEndPhase, defineCard, fanfare } from "../helpers";
import { playPointsCost } from "../costs";
import { enemyLeaderOrFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      cost: playPointsCost(5),
      *resolve(fx) {
        const others = [...fx.game.followers(fx.controller), ...fx.game.followers(fx.game.opponent(fx.controller))].filter(
          (id) => id !== fx.self,
        );
        yield* fx.dealDamageEach(others, 5);
        yield* fx.giveStats(fx.self, 2, 2);
        yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
    atStartOfYourEndPhase({
      targets: [enemyLeaderOrFollower({ when: (g, c) => g.sanguine(c) })],
      *resolve(fx) {
        const target = fx.targets[0]?.[0];
        if (target !== undefined) yield* fx.dealDamage(target, 3);
      },
    }),
  ],
});
