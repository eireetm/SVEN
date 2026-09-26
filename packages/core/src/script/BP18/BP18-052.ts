// BP18-052 Bejeweled Bouncer (Evolved) — 2/3.
// Storm.
// Strike - Give this {[attack]}+1/{[defense]}+1 for every 5 cards in your banished zone.
// (effect_en says "On Evolve"; the official English, Japanese 【攻撃時】 and Chinese 【攻击时】 all say Strike: the majority is
// implemented — reported to the user.)
import { defineCard, strike } from "../helpers";
import { banishedCount } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    strike({
      *resolve(fx) {
        const x = Math.floor(banishedCount(fx.game, fx.controller) / 5);
        if (x > 0 && fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, x, x);
      },
    }),
  ],
});
