// BP14-117 Brave Goblin (Evolved) — Neutral follower, 3/3. ゴブリン.
// On Evolve - Draw a card.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
