// BP14-015 Woodland Pest Control — Forestcraft follower, 2, 2/1. 狩人・獣.
// Rush.
// {[fanfare]} If there are at least 3 Hunter cards in your cemetery, give this {[attack]}+2 and Assail.
import { defineCard, fanfare } from "../helpers";
import { countIn, hunter } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      condition: (g, p) => countIn(g, p, "cemetery", hunter) >= 3,
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone !== "field") return;
        yield* fx.giveStats(fx.self, 2, 0);
        yield* fx.giveKeyword(fx.self, "assail");
      },
    }),
  ],
});
