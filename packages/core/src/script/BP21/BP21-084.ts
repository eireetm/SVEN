// BP21-084 Noble Demoness — Abysscraft follower, 2, 2/3. 魔界.
// Whenever another 2-cost follower is put onto your field, deal 1 damage to each enemy leader. (元のコスト; on the opponent's
// turn too — ruling.)
import { defineCard, whenFollowerEntersYourField } from "../helpers";

export default defineCard({
  abilities: [
    whenFollowerEntersYourField(
      {
        *resolve(fx) {
          yield* fx.dealDamageEach([fx.game.leader(fx.game.opponent(fx.controller))], 1);
        },
      },
      { another: true, filter: (g, id) => g.info(id).cost === 2 },
    ),
  ],
});
