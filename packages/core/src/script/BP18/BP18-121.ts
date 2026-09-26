// BP18-121 Stunfist Assassin — Neutral follower, 4, 4/4. 透京.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Select an enemy follower on the field and deal it 4 damage.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
  ],
});
