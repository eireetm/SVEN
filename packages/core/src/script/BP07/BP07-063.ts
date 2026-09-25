// BP07-063 Dragonewt Needler — Dragoncraft follower, 3, 2/4. ドラゴニュート.
// Whenever a Dragonewt follower on your field attacks, deal 2 damage to each enemy leader. (This one
// too. It resolves before the quick timing — ruling, CR 8.4.6.)
import { defineCard, whenYourFollowerAttacks } from "../helpers";
import { hasTrait } from "../targets";

export default defineCard({
  abilities: [
    whenYourFollowerAttacks(
      {
        *resolve(fx) {
          yield* fx.dealDamageEach([fx.game.leader(fx.game.opponent(fx.controller))], 2);
        },
      },
      hasTrait("ドラゴニュート"),
    ),
  ],
});
