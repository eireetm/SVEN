// BP01-015 Nature's Guidance — Forestcraft spell, 1.
// Select a card on your field. Return it to its owner's hand and draw a card. (Amulets too — ruling.)
import { defineCard, spell } from "../helpers";
import { yourCardOnField } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [yourCardOnField()],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
        yield* fx.draw(1);
      },
    }),
  ],
});
