// BP17-T09 Eschamali Adviser — Havencraft follower token, 2, 2/2. 信仰.
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
