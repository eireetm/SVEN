// BP14-T01 Sootspawn — Swordcraft follower token, 2, 2/2. 宴楽.
// Ward.
// {[lastwords]} Select an enemy follower on the field and deal it 2 damage.
import { defineCard, lastWords } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    lastWords({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
