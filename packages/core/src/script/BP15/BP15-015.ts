// BP15-015 Hermit of Unkilling (Evolved) — Forestcraft follower, 3/3. 絶傑・狩人.
// On Evolve - Search your deck for a follower with "Izudia" in its name, reveal it, add it to your hand, then
// shuffle.
import { defineCard, onEvolve } from "../helpers";
import { and, isFollower, nameIncludes } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => and(isFollower, nameIncludes("Izudia"))(fx.game, id));
      },
    }),
  ],
});
