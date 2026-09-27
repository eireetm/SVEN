// SD04-012 Dragonrider — Dragoncraft follower, 2, 2/2. 竜使い.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} If Overflow is active for you, put a Dragon token into your EX area. (Nothing with a full EX area — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        if (fx.game.overflow(fx.controller)) yield* fx.tokensToEx(["Dragon"]);
      },
    }),
  ],
});
