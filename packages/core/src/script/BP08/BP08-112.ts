// BP08-112 Ephemera, Sword Angel — Neutral follower, 1, 2/1. 天使.
// Rush. Fanfare: if an opponent has at least 3 cards on their field, this gains +1 attack and
// Assail. CR 10.7.3.2, 12.10, 12.11.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      condition: (g, p) => g.cards(g.opponent(p), "field").length >= 3,
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 1, 0);
        yield* fx.giveKeyword(fx.self, "assail");
      },
    }),
  ],
});
