// BP15-018 Emerald Wildfox — Forestcraft follower, 4, 5/5. 精霊・獣.
// {[fanfare]} Draw a card.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
