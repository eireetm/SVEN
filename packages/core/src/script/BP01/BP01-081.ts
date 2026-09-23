// BP01-081 Shapeshifting Mage — Dragoncraft follower, 2, 2/2.
// {[evolve]}{[cost01]}: Evolve this follower.
// {[fanfare]} If Overflow is active for you, give this follower +3/+3. (CR 13.4.1.2)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        if (fx.game.overflow(fx.controller)) yield* fx.giveStats(fx.self, 3, 3);
      },
    }),
  ],
});
