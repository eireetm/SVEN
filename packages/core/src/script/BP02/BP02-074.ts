// BP02-074 Azazel — Abysscraft follower, 7, 6/6.
// Necrocharge (10): This card costs 3 less to play. (CR 13.5.1, 10.4.4.1)
// {[evolve]}{[cost01]}: Evolve this follower. // Bane.
// {[fanfare]} Each opponent discards a random card. (CR 5.19, 5.12)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  keywords: ["bane"],
  playCost: (g, _self, controller) => (g.necrocharge(controller, 10) ? -3 : 0),
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.discardRandom(1, fx.game.opponent(fx.controller));
      },
    }),
  ],
});
