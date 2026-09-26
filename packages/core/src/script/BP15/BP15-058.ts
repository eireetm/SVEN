// BP15-058 Filene, Blizzardous Heart — Dragoncraft follower, 2, 1/2. ドラゴニュート.
// {[evolve]} {[cost01]}: Evolve this.
// Bane.
// {[fanfare]} If Overflow is active for you, during each opponent's next turn, any card they play costs 1 more.
// (Also after this leaves the field; twice is +2; also for cards played by effects; applied after "costs N" —
// rulings, CR 10.10.2.4.)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  keywords: ["bane"],
  abilities: [
    evolveAbility(1),
    fanfare({
      condition: (g, p) => g.overflow(p),
      *resolve(fx) {
        yield* fx.restrictPlayer(fx.game.opponent(fx.controller), "playCostPlus1");
      },
    }),
  ],
});
