// BP06-002 Lymaga, Forest Champion (Evolved) — Forestcraft follower, 5/5. 挑戦者・狩人.
// Storm. Bane.
// On Evolve: Look at the top 4 cards of your deck. You may summon a Hunter follower that costs 4
// or less from among them. Put the rest on the bottom of your deck in any order.
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { and, costAtMost, hasTrait, isFollower } from "../targets";

export default defineCard({
  keywords: ["storm", "bane"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: and(isFollower, hasTrait("狩人"), costAtMost(4)), to: "field" });
      },
    }),
  ],
});
