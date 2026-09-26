// BP13-030 Mina, Levin Vice Leader — Swordcraft follower, 2, 2/2. 指揮官・レヴィオン.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Select an enemy follower on the field and, if there are at least 5 Levin cards in your
// cemetery, deal it 3 damage.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { countIn, levin } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (countIn(fx.game, fx.controller, "cemetery", levin) >= 5) yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
  ],
});
