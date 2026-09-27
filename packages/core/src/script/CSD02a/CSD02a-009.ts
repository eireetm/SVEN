// CSD02a-009 Nene Kurihara — Dragoncraft follower, 5, 3/4. デレマス・キュート.
// {[evolve]} {[cost01]}: Evolve this follower.
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
