// BP10-122 Winged Courier — Neutral follower, 2, 3/2. 傭兵.
// Strike - Draw a card.
import { defineCard, strike } from "../helpers";

export default defineCard({
  abilities: [
    strike({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
