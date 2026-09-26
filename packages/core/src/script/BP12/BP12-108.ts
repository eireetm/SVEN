// BP12-108 Romantic Chanteuse — Neutral follower, 3, 3/3. シンガー.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Select an enemy follower on the field and engage it.
// {[act]} {[cost02]}: Select an enemy follower on the field and engage it.
import { activated, defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.engage(fx.targets[0]!);
      },
    }),
    activated(
      { playPoints: 2 },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.engage(fx.targets[0]!);
        },
      },
    ),
  ],
});
