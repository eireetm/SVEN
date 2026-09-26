// BP11-098 Enchanted Knight (Evolved) — Havencraft follower, 2/2. 信仰.
// Ward.
// On Evolve - If there are at least 4 followers with Ward on your field, draw 2 cards.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      condition: (g, p) => g.followers(p).filter((id) => g.hasKeyword(id, "ward")).length >= 4,
      *resolve(fx) {
        yield* fx.draw(2);
      },
    }),
  ],
});
