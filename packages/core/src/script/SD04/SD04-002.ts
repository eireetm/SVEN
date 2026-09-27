// SD04-002 Dragon Oracle — Dragoncraft spell, 2. 竜族.
// Choose one of the following effects. (1) Increase your maximum play points by 1. (2) Draw a card. ((1) doesn't give a play point
// and can be chosen at 10 — rulings, CR 5.3.)
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      modes: [
        {
          id: "1",
          label: "Increase your maximum play points by 1",
          *resolve(fx) {
            yield* fx.increaseMaxPlayPoints(1);
          },
        },
        {
          id: "2",
          label: "Draw a card",
          *resolve(fx) {
            yield* fx.draw(1);
          },
        },
      ],
    }),
  ],
});
