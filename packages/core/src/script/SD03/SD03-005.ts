// SD03-005 Insight — Runecraft spell, 1. 魔法使い. {[quick]}
// Draw a card.
import { defineCard, spell } from "../helpers";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
