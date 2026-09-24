// BP05-066 Airship Whale (Evolved) — Dragoncraft follower, 6/6. 海洋・超克.
// On Evolve: Look at the top 5 cards of your deck. You may put a follower that costs 3 play points
// or less from among them onto your field. Put the remaining cards on the bottom of your deck in
// any order. (元のコスト: printed cost.)
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { and, costAtMost, isFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 5, { filter: and(isFollower, costAtMost(3)), to: "field" });
      },
    }),
  ],
});
