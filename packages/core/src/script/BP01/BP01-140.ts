// BP01-140 Dark Offering — Havencraft spell, 1. {[quick]}
// Select a card on your field. Destroy it, give your leader +3 defense, and draw a card.
import { defineCard, spell } from "../helpers";
import { yourCardOnField } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [yourCardOnField()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
        yield* fx.giveLeaderDefense(fx.controller, 3);
        yield* fx.draw(1);
      },
    }),
  ],
});
