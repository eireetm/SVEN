// CP02-100 Layla (Evolved) — 5/5.
// On Evolve - Search your deck for a Cool follower and Passion follower, reveal them, add them to your hand, then shuffle your
// deck. (Two different cards; one with both types may be either — CP02-103 ruling; CR 5.8.)
import { defineCard, onEvolve } from "../helpers";
import { cool, followerThat, passion } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.searchEach([(id) => followerThat(cool)(g, id), (id) => followerThat(passion)(g, id)]);
      },
    }),
  ],
});
