// BP03-016 Floral Breeze — Forestcraft spell, 1. 植物族・獣.
// Select a card on your field. Return it to its owner's hand and give your leader +1 defense.
import { defineCard, spell } from "../helpers";
import { yourCardOnField } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [yourCardOnField()],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
