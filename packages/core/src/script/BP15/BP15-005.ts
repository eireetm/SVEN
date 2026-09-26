// BP15-005 Piercye, Queen of Frost (Evolved) — Forestcraft follower, 4/4. エルフ族.
// On Evolve - Search your deck for a follower that costs 2 or less, reveal it, add it to your hand, then shuffle.
// Whenever a follower on your field evolves, deal 1 damage to each enemy leader and 2 damage to each enemy
// follower on the field, and give your leader {[defense]}+1.
import { defineCard, onEvolve } from "../helpers";
import { and, costAtMost, isFollower } from "../targets";
import { piercyeFrost } from "./shared-forest";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => and(isFollower, costAtMost(2))(fx.game, id));
      },
    }),
    piercyeFrost,
  ],
});
