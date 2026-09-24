// BP03-095 Wingy, Chirpy Gemstone (Evolved) — Havencraft, 2/2.
// Ward.
// On Evolve: Search for a follower with 2 attack or less and add it to your hand.
import { defineCard, onEvolve } from "../helpers";
import { isFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => isFollower(fx.game, id) && (fx.game.info(id).attack ?? 99) <= 2);
      },
    }),
  ],
});
