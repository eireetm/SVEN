// BP15-068 Windswept Dragonewt — Dragoncraft follower, 2, 3/1. ドラゴニュート・武闘竜人.
// Rush.
// {[fanfare]} If Overflow is active for you, give this {[attack]}+1/{[defense]}+1.
// Strike - Give your leader {[defense]}+X, where X equals this follower 's defense.
import { defineCard, fanfare, strike } from "../helpers";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      condition: (g, p) => g.overflow(p),
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
    strike({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone !== "field") return;
        yield* fx.giveLeaderDefense(fx.controller, Math.max(0, fx.game.info(fx.self).defense ?? 0));
      },
    }),
  ],
});
