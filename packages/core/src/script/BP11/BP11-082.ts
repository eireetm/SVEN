// BP11-082 Skeleton Dreamer — Abysscraft follower, 2, 2/3. 荒野・死者.
// Whenever this follower gains attack or defense, give it Storm.
// {[lastwords]} Summon a Bullet Bike token. Bury the top card of your deck.
import { defineCard, whenThisGainsStats } from "../helpers";
import { bikeAndBury } from "./shared-abyss";

export default defineCard({
  abilities: [
    whenThisGainsStats({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
    bikeAndBury(1),
  ],
});
