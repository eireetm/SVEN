// BP08-059 Elios, Loyal Dragoon — Dragoncraft follower, 3, 2/4. 竜使い.
// {[evolve]} {[cost03]}: Evolve this follower. Ward.
// Whenever it takes positive damage, give it and your leader +1 defense. Lethal damage still
// triggers; the absent follower receives nothing but the leader does (rulings, CR 5.14, 10.7.2).
import { defineCard, evolveAbility, whenThisTakesDamage } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(3),
    whenThisTakesDamage({
      *resolve(fx) {
        if (fx.game.card(fx.self) !== undefined) yield* fx.giveStats(fx.self, 0, 1);
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
