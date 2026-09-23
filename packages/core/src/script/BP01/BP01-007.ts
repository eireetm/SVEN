// BP01-007 Silver Bolt — Forestcraft spell, 7. {[quick]}
// Select an enemy leader or enemy follower on the field. Draw a card and then deal X damage to
// the selected enemy. X equals the number of cards in your hand (after drawing; the spell is
// no longer in hand — rulings).
import { defineCard, spell } from "../helpers";
import { enemyLeaderOrFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyLeaderOrFollower()],
      *resolve(fx) {
        yield* fx.draw(1);
        yield* fx.dealDamage(fx.targets[0]![0]!, fx.game.cards(fx.controller, "hand").length);
      },
    }),
  ],
});
