// BP01-035 Maid Leader (Evolved) — 2/2.
// On Evolve: Search your deck for a follower with {[evolve]}, reveal it, and add it to your hand.
// (May find nothing; the deck is shuffled — rulings, CR 5.8.)
import { defineCard, onEvolve } from "../helpers";
import { isFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.search((id) => isFollower(g, id) && g.hasEvolveAbility(g.card(id)!.def));
      },
    }),
  ],
});
