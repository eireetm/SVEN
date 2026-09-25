// BP09-013 Grasshopper Conductor (Evolved) — Forestcraft follower, 4/4. 精霊・虫族.
// On Evolve - Search your deck for a {[forestcraft]} spell that costs 1 or less, reveal it, add it to
// your hand, then shuffle your deck. (元のコスト.)
import { defineCard, onEvolve } from "../helpers";
import { costAtMost } from "../targets";
import { forestSpell } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => forestSpell(fx.game, id) && costAtMost(1)(fx.game, id));
      },
    }),
  ],
});
