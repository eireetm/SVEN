// BP17-T08 Luna's Doll — Abysscraft amulet token, 1. 死霊術師・人形.
// {[fanfare]} Bury the top 2 cards of your deck.
// Activate {[engage]} this, bury this: Draw a card. Activate only if there are at least 10 cards in your cemetery.
import { activated, defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.mill(2);
      },
    }),
    activated(
      { engageSelf: true, burySelf: true },
      {
        condition: (g, c) => g.cards(c, "cemetery").length >= 10,
        *resolve(fx) {
          yield* fx.draw(1);
        },
      },
    ),
  ],
});
