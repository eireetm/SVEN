// BP05-005 Apostle of Unkilling (Evolved) — Forestcraft follower, 4/4. 絶傑・狩人.
// On Evolve: Search your deck for a Hunter follower that costs 2 play points or less, put it onto
// your field, then shuffle your deck. (元のコスト: its printed cost.)
import { defineCard, onEvolve } from "../helpers";
import { and, costAtMost, hasTrait, isFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => and(isFollower, hasTrait("狩人"), costAtMost(2))(fx.game, id), { to: "field" });
      },
    }),
  ],
});
