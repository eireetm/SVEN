// BP01-029 Shadowed Assassin — Swordcraft follower, 4, 4/4.
// {[evolve]}{[cost02]}: Evolve this follower.
// {[fanfare]} Select an enemy follower on the field and engage it. (An engaged one may be
// selected; it stays engaged — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.engage(fx.targets[0]!);
      },
    }),
  ],
});
