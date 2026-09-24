// BP02-102 Soul Collector — Havencraft follower, 6, 4/4.
// {[evolve]}{[cost01]}: Evolve this follower.
// {[fanfare]} Select an enemy follower that costs 4 play points or less on the field and banish it.
// (Printed cost — ruling; CR 2.5.1.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { costAtMost, enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyFollower({ filter: costAtMost(4) })],
      *resolve(fx) {
        yield* fx.banish(fx.targets[0]!);
      },
    }),
  ],
});
