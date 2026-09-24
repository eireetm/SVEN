// BP02-012 Dwarf Perfurmer — Forestcraft follower, 2, 2/3.
// Whenever one of your followers evolves, select an enemy follower on the field and deal it 2
// damage.
import { defineCard, whenYourFollowerEvolves } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    whenYourFollowerEvolves({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
