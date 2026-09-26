// BP18-045 Aleister, Argenteum Astrum — Runecraft follower, 3, 2/4. 魔法使い.
// Rush. Drain.
// {[fanfare]} Banish the top 2 cards of your deck. Then, if there are at least 5 cards in your banished zone, give this
// Assail. If there are at least 10, give this {[attack]}+1/{[defense]}+1 (The 2 just banished count — ruling.)
import { defineCard, fanfare } from "../helpers";
import { banishedCount } from "./shared";
import { banishTop } from "./shared-rune";

export default defineCard({
  keywords: ["rush", "drain"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* banishTop(fx, 2);
        const n = banishedCount(fx.game, fx.controller);
        if (fx.game.card(fx.self)?.zone !== "field") return;
        if (n >= 5) yield* fx.giveKeyword(fx.self, "assail");
        if (n >= 10) yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
  ],
});
