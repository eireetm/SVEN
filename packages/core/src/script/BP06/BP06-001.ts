// BP06-001 Lymaga, Forest Champion — Forestcraft follower, 6, 4/4. 挑戦者・狩人.
// {[evolve]} {[cost02]}: Evolve this follower.
// Storm. Bane.
// {[fanfare]} Look at the top 4 cards of your deck. You may summon a Hunter follower that costs 4
// or less from among them. Put the rest on the bottom of your deck in any order.
import { defineCard, evolveAbility, fanfare, lookAtTopCards } from "../helpers";
import { and, costAtMost, hasTrait, isFollower } from "../targets";

export default defineCard({
  keywords: ["storm", "bane"],
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: and(isFollower, hasTrait("狩人"), costAtMost(4)), to: "field" });
      },
    }),
  ],
});
