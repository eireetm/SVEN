// BP12-012 Forest Hatcheteer — Forestcraft follower, 3, 3/3. エルフ族・狩人.
// {[evolve]} {[cost04]}: Evolve this follower.
// Rush.
// Strike - Select an enemy follower on the field and deal it 2 damage.
import { defineCard, evolveAbility, strike } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    evolveAbility(4),
    strike({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
