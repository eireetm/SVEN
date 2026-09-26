// BP08-060 Elios, Loyal Dragoon (Evolved) — Dragoncraft follower, 4/6. 竜使い.
// Storm. Ward. Whenever it takes positive damage, give it and your leader +1 defense. Lethal
// damage still gives the leader defense (rulings, CR 5.14, 10.7.2).
import { defineCard, whenThisTakesDamage } from "../helpers";

export default defineCard({
  keywords: ["storm", "ward"],
  abilities: [
    whenThisTakesDamage({
      *resolve(fx) {
        if (fx.game.card(fx.self) !== undefined) yield* fx.giveStats(fx.self, 0, 1);
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
