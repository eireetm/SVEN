// BP01-090 Serpent Wrath — Dragoncraft spell, 3. {[quick]}
// Select an enemy follower on the field. Deal it 5 damage and, if Overflow is active for you,
// draw a card.
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
        if (fx.game.overflow(fx.controller)) yield* fx.draw(1);
      },
    }),
  ],
});
