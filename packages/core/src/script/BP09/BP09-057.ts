// BP09-057 Dragonplate Warrior — Dragoncraft follower, 5, 3/5. 竜使い.
// {[fanfare]} If Overflow is active for you, recover 2 play points.
// During your turn, whenever you play a {[dragoncraft]} spell, deal 2 damage to each enemy follower on
// the field. (It triggers as the spell is played, even if that spell then moves this card — ruling.)
import { defineCard, fanfare, whenYouPlay } from "../helpers";
import { dragonSpell } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        if (fx.game.overflow(fx.controller)) yield* fx.recoverPlayPoints(2);
      },
    }),
    whenYouPlay(
      {
        condition: (g, c) => g.activePlayer === c,
        *resolve(fx) {
          yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 2);
        },
      },
      dragonSpell,
    ),
  ],
});
