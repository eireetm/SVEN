// BP02-059 Siegfried — Dragoncraft follower, 4, 3/3.
// {[evolve]}{[cost01]}: Evolve this follower.
// {[fanfare]} Select an enemy follower on the field and deal it 2 damage.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
