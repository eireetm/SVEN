// BP09-063 Heroic Dragonslayer — Dragoncraft follower, 2, 1/2. 竜族・キラー.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} If Overflow is active for you, give this follower {[attack]}+2.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        if (fx.game.overflow(fx.controller) && fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 2, 0);
      },
    }),
  ],
});
