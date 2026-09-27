// CP03-062 Girl Who Crossed the Gap — Runecraft amulet, 2. ヴァンガード・ペイルムーン.
// Starting Amulet. (All cards with Starting Amulet in your deck must share the same name.) (CR 14.4.4, the engine's.)
// Activate {[engage]}, bury this card: Draw a card. Banish a card from your hand. Activate only if there's a Pale Moon follower on
// your field.
import { activated, defineCard } from "../helpers";
import { followerThat, paleMoon } from "./shared";

export default defineCard({
  keywords: ["startingAmulet"],
  abilities: [
    activated(
      { engageSelf: true, burySelf: true },
      {
        condition: (g, c) => g.followers(c).some((id) => followerThat(paleMoon)(g, id)),
        *resolve(fx) {
          yield* fx.draw(1);
        const hand = fx.game.cards(fx.controller, "hand");
        yield* fx.banish(yield* fx.chooseCards(hand, Math.min(1, hand.length), 1));
        },
      },
    ),
  ],
});
