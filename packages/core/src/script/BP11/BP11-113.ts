// BP11-113 Rivaylian Bandit — Neutral follower, 1, 1/1. 荒野・傭兵.
// {[evolve]} {[cost01]}: Evolve this follower.
// Whenever this follower gains attack or defense, give it Storm.
import { defineCard, evolveAbility, whenThisGainsStats } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    whenThisGainsStats({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
  ],
});
