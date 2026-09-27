// CSD03b-009 Embodiment of Armor, Bahr — Dragoncraft follower, 3, 3/4. ヴァンガード・かげろう.
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
