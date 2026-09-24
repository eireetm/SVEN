// BP05-T05 Mystic Artifact — Neutral follower token, 3, 2/3. 超克.
// Ward.
// {[fanfare]} Draw a card.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
