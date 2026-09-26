// BP16-068 Kit, Luxfang Champion — Dragoncraft follower, 1, 2/1. ドラゴニュート.
// When this is discarded, you may put it into your EX area.
// ----------
// Rush.
// {[fanfare]} If Overflow is active for you, give this {[attack]}+1 and Assail.
import { defineCard, fanfare } from "../helpers";
import { discardedToEx } from "../BP12/shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    discardedToEx,
    fanfare({
      condition: (g, p) => g.overflow(p),
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone !== "field") return;
        yield* fx.giveStats(fx.self, 1, 0);
        yield* fx.giveKeyword(fx.self, "assail");
      },
    }),
  ],
});
