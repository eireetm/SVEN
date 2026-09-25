// BP06-063 Ice Dancing Dragonewt — Dragoncraft follower, 2, 2/2. ドラゴニュート・竜族.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} If Overflow is active for you, give this follower {[attack]}+1 and Storm.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        if (!fx.game.overflow(fx.controller)) return;
        yield* fx.giveStats(fx.self, 1, 0);
        yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
  ],
});
