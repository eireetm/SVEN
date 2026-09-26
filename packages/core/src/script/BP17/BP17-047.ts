// BP17-047 Enforcer — Runecraft follower, 1, 1/1. 機械・ゴーレム.
// Rush.
// {[fanfare]} If there are at least 3 Machina cards in your EX area, give this {[attack]}+3 and Assail.
// {[lastwords]} Put an Assembly Droid token into your EX area.
import { defineCard, fanfare, lastWords } from "../helpers";
import { DROID, machinaInEx } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      condition: (g, p) => machinaInEx(g, p) >= 3,
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone !== "field") return;
        yield* fx.giveStats(fx.self, 3, 0);
        yield* fx.giveKeyword(fx.self, "assail");
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.tokensToEx([DROID]);
      },
    }),
  ],
});
