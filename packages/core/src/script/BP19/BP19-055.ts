// BP19-055 Meandering Bolt — Runecraft spell, 3. 魔法使い.
// Select an enemy follower on the field. Draw a card. Deal damage to the selected follower equal to the number of cards in
// your hand. (Not playable without a target — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.draw(1);
        const n = fx.game.cards(fx.controller, "hand").length;
        if (n > 0) yield* fx.dealDamage(fx.targets[0]![0]!, n);
      },
    }),
  ],
});
