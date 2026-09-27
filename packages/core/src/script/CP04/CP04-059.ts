// CP04-059 Kaya — Dragoncraft follower, 6, 4/4. プリコネ・ドラゴンズネスト.
// {[evolve]} {[cost01]}: Evolve this.
// Storm.
// {[fanfare]} Select an enemy follower on the field. Deal it 4 damage and, if you have 10 max play points, evolve this. (Without an
// enemy follower it isn't played, so it doesn't evolve — ruling.)
// Whenever a {[ub]} ability of another follower on your field is executed, deal 2 damage to each enemy leader.
import { defineCard, evolveAbility, fanfare, whenAnotherFollowersUnionBurst } from "../helpers";
import { enemyFollower } from "../targets";
import { damageEnemyLeader, tenMaxPlayPoints } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        if (tenMaxPlayPoints(fx.game, fx.controller)) yield* fx.evolve(fx.self);
      },
    }),
    whenAnotherFollowersUnionBurst({
      *resolve(fx) {
        yield* damageEnemyLeader(fx, 2);
      },
    }),
  ],
});
