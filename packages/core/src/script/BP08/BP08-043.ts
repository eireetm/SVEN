// BP08-043 Elusa, Magic Wunderkind (Evolved) — Runecraft follower, 2/2. 魔法使い・学院.
// On Evolve - Search your deck for an Arcanaform follower, reveal it, add it to your hand, then
// shuffle your deck.
import { defineCard, onEvolve } from "../helpers";
import { and, hasTrait, isFollower } from "../targets";

const arcanaform = and(isFollower, hasTrait("魔法生物"));

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => arcanaform(fx.game, id));
      },
    }),
  ],
});
