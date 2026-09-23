// BP01-T12 Mimi (Mimi, Infernal Right Paw) — Abysscraft spell token, 0.
// Select an enemy follower on the field and deal it 2 damage.
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
