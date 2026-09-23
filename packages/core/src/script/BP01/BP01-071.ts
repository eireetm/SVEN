// BP01-071 Wind Blast — Runecraft spell, 1.
// Select an enemy follower on the field and deal it 2 damage. Spellchain (10): Deal 4 damage
// instead. (4, not 6 — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, fx.game.spellchain(fx.controller, 10) ? 4 : 2);
      },
    }),
  ],
});
