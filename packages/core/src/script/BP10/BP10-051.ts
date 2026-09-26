// BP10-051 Arcane Auteur — Runecraft follower, 4, 4/4. 魔法使い.
// {[fanfare]} Choose one. (1) Draw a card. (2) Select a spell in your cemetery and add it to your hand.
// ((2) can't be chosen without a spell there — ruling.)
import { defineCard, fanfare } from "../helpers";
import { inYourZone, isSpell } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      modes: [
        {
          id: "draw",
          label: "(1) Draw a card",
          *resolve(fx) {
            yield* fx.draw(1);
          },
        },
        {
          id: "spell",
          label: "(2) Add a spell from your cemetery to your hand",
          targets: [inYourZone("cemetery", { filter: isSpell })],
          *resolve(fx) {
            yield* fx.returnToHand(fx.targets[0]!);
          },
        },
      ],
    }),
  ],
});
