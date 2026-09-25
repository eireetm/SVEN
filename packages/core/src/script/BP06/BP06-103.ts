// BP06-103 Barrage Brawler — Havencraft follower, 1, 0/1. 信仰.
// {[evolve]} Discard a card: {[evolve]} this follower.
// At the start of your end phase, if you have at least 2 play points, select an enemy leader and
// deal it 1 damage.
import { atStartOfYourEndPhase, defineCard, evolveAbility } from "../helpers";
import { discardCardsCost } from "../costs";
import { enemyLeader } from "../targets";
import { playPointsOf } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility({ custom: discardCardsCost(1) }),
    atStartOfYourEndPhase({
      targets: [enemyLeader({ when: (g, c) => playPointsOf(g, c) >= 2 })],
      *resolve(fx) {
        const leader = fx.targets[0]?.[0];
        if (leader !== undefined) yield* fx.dealDamage(leader, 1);
      },
    }),
  ],
});
