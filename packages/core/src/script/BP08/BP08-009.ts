// BP08-009 Michelle, the Mind Reader (Evolved) — Forestcraft follower, 2/2. 精霊.
// On Evolve - Search your deck for a {[forestcraft]} follower that costs 5 or more, reveal it, add it
// to your hand, then shuffle your deck. (元のコスト.)
import { defineCard, onEvolve } from "../helpers";
import { and, costAtLeast, isClass, isFollower } from "../targets";

const bigForestFollower = and(isFollower, isClass("Forestcraft"), costAtLeast(5));

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => bigForestFollower(fx.game, id));
      },
    }),
  ],
});
