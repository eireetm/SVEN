// BP21-T08 Holy Cavalier — Havencraft follower token, 1, 1/2. 先導.
// Ward.
// Whenever this gains {[attack]}, give it Rush. (On the opponent's turn too — ruling.)
import { defineCard, whenThisGainsAttack } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    whenThisGainsAttack({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "rush");
      },
    }),
  ],
});
