// DSD01a-002 Grea, Mysterian Dragoness — Runecraft follower, 3, 3/3. 魔法使い・学院・プリンセス.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Select an enemy follower on the field. If there are at least 10 Academic cards in your cemetery, deal 4 damage to it and
// 1 damage to its leader.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { academicsInCemetery, leaderOf } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (academicsInCemetery(fx.game, fx.controller) < 10) return;
        const target = fx.targets[0]![0]!;
        const leader = leaderOf(fx, target);
        yield* fx.dealDamage(target, 4);
        yield* fx.dealDamage(leader, 1);
      },
    }),
  ],
});
