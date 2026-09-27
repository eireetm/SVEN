// CP04-085 Misaki — Abysscraft follower, 1, 1/1. プリコネ・ルーセント学院.
// {[ub]} Strike - Select an enemy follower on the field and deal it 3 damage.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Deal 2 damage to your leader.
import { defineCard, evolveAbility, fanfare, strike, ub } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    ub(
      strike({
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        },
      }),
    ),
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.controller), 2);
      },
    }),
  ],
});
