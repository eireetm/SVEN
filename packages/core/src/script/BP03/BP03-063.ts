// BP03-063 Master of Draconic Arts — Dragoncraft follower, 3, 2/4. 竜使い.
// Assail. Ward.
// {[fanfare]} If Overflow is active for you, +4 attack and Rush.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["assail", "ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        if (!fx.game.overflow(fx.controller)) return;
        yield* fx.giveStats(fx.self, 4, 0);
        yield* fx.giveKeyword(fx.self, "rush");
      },
    }),
  ],
});
