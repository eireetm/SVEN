// BP10-038 0. Lhynkal, The Fool (Evolved) — Runecraft follower, 3/3. アルカナ・魔法使い.
// Whenever you play an Arcana spell, select an enemy follower on the field and deal it 3 damage
import { defineCard, whenYouPlay } from "../helpers";
import { enemyFollower } from "../targets";
import { arcanaSpell } from "./shared";

export default defineCard({
  abilities: [
    whenYouPlay(
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        },
      },
      arcanaSpell,
    ),
  ],
});
