// BP01-016 Harvest Festival — Forestcraft amulet, 1.
// {[act]}{[cost01]}, {[engage]}, put this card into its owner's cemetery: Give your leader +1 defense.
// When this card leaves the field, draw a card.
import { activated, defineCard, whenThisLeavesField } from "../helpers";

export default defineCard({
  abilities: [
    activated(
      { playPoints: 1, engageSelf: true, burySelf: true },
      {
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 1);
        },
      },
    ),
    whenThisLeavesField({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
