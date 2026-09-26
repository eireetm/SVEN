// BP12-009 Forest Defender (Evolved) — Forestcraft follower, 4/5. 狩人・獣.
// Whenever another Hunter follower on your field attacks, select an enemy follower on the field and deal
// it 3 damage.
// On Evolve - Look at the top 4 cards of your deck. You may summon a Hunter follower that costs 3 or less
// from among them. Put the rest on the bottom of your deck in any order.
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { and, costAtMost, isFollower } from "../targets";
import { forestDefenderTrigger, hunter } from "./shared";

export default defineCard({
  abilities: [
    forestDefenderTrigger,
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: and(isFollower, hunter, costAtMost(3)), to: "field" });
      },
    }),
  ],
});
