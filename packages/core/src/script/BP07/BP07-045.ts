// BP07-045 Splendid Conjury — Runecraft spell, 2. 魔法使い.
// Select up to 3 enemy followers on the field and deal 3 damage divided between them. If there's an
// Eleanor, Cosmic Flower on your field, deal 5 damage divided between them instead.
// (At least 1 to each selected follower — rulings BP08-028 / EBD02-015.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { onYourField } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower({ count: 3, upTo: true })],
      *resolve(fx) {
        const total = onYourField(fx.game, fx.controller, "Eleanor, Cosmic Flower") ? 5 : 3;
        yield* fx.dealDividedDamage(fx.targets[0]!, total);
      },
    }),
  ],
});
