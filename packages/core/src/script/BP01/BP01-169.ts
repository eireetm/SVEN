// BP01-169 Execution — Neutral spell, 4. {[quick]}
// Select an enemy card on the field and destroy it.
import { defineCard, spell } from "../helpers";
import { enemyCardOnField } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyCardOnField()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
      },
    }),
  ],
});
