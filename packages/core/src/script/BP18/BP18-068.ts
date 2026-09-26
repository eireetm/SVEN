// BP18-068 Ian, Dragon Buster — Dragoncraft follower, 5, 4/4. 竜使い.
// {[evolve]} {[cost01]}: Evolve this.
// Ward.
// {[fanfare]} Select an enemy follower on the field and deal it 5 damage.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
      },
    }),
  ],
});
