// BP19-013 Beast Lancer — Forestcraft follower, 4, 3/5. 獣.
// {[evolve]} {[cost01]}: Evolve this.
// Ward.
// {[fanfare]} Select an enemy follower on the field and deal it 3 damage.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
  ],
});
