// BP09-058 Force of the Dragonewt — Dragoncraft spell, 2. ドラゴニュート. Quick.
// Select an enemy follower on the field. Deal it 3 damage, draw a card, then discard a card. (Without a
// target it can't be played — ruling. A card discarded in the opponent's turn triggers its "when
// discarded" — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        yield* fx.draw(1);
        const n = Math.min(1, fx.game.cards(fx.controller, "hand").length);
        yield* fx.discard(fx.controller, n, n);
      },
    }),
  ],
});
