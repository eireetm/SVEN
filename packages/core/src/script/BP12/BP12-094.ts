// BP12-094 Holylight Convert (Evolved) — Havencraft follower, 2/5. 信仰.
// Ward.
// On Evolve - Search your deck for a follower with Ward that costs 3 or less, summon it, then shuffle.
// At the start of your end phase, give this follower {[attack]}+X, where X equals the number of followers
// with Ward on your field.
import { defineCard, onEvolve } from "../helpers";
import { and, costAtMost, isFollower } from "../targets";
import { convertEndPhase } from "./shared-haven";

const cheapFollower = and(isFollower, costAtMost(3));

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => cheapFollower(fx.game, id) && fx.game.hasKeyword(id, "ward"), { to: "field" });
      },
    }),
    convertEndPhase,
  ],
});
