// BP07-079 Forbidden Art — Abysscraft spell, 2. 機械・死者.
// Select an enemy follower on the field and deal it 4 damage. If there is a Nicola, Forbidden
// Strength on your field, deal 6 damage instead.
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { onYourField } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, onYourField(fx.game, fx.controller, "Nicola, Forbidden Strength") ? 6 : 4);
      },
    }),
  ],
});
