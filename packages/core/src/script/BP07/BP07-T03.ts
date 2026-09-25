// BP07-T03 Naterran Great Tree — Neutral amulet token, 1. 自然.
// When this card leaves the field, draw a card, then discard a card. (Look-back, CR 10.7.4.1. Several
// leaving together: each resolves in any order — ruling.)
// {[act]} {[cost01]}: Bury this card.
import { activated, defineCard, whenThisLeavesField } from "../helpers";

export default defineCard({
  abilities: [
    whenThisLeavesField({
      *resolve(fx) {
        yield* fx.draw(1);
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
    activated(
      { playPoints: 1 },
      {
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "field") yield* fx.bury([fx.self]);
        },
      },
    ),
  ],
});
