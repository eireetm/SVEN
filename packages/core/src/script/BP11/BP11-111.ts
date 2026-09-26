// BP11-111 Supercharged Guitarist — Neutral follower, 4, 3/3. シンガー.
// Assail.
// {[fanfare]} Draw a card.
// Strike - Recover 3 play points.
import { defineCard, fanfare, strike } from "../helpers";

export default defineCard({
  keywords: ["assail"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
    strike({
      *resolve(fx) {
        yield* fx.recoverPlayPoints(3);
      },
    }),
  ],
});
