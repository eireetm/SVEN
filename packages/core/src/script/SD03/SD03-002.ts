// SD03-002 Rune Blade Summoner — Runecraft follower, 3, 1/1. 魔法使い.
// {[fanfare]}, Spellchain (5): Give this follower {[attack]}+4/{[defense]}+4. SC (10): Give this follower Storm. (Both with 10 —
// ruling.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        if (!fx.game.spellchain(fx.controller, 5)) return;
        yield* fx.giveStats(fx.self, 4, 4);
        if (fx.game.spellchain(fx.controller, 10)) yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
  ],
});
