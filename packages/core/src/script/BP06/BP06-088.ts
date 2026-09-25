// BP06-088 Demonic Procession — Abysscraft spell, 1. 妖怪.
// Look at the top 5 cards of your deck. You may reveal a Yokai follower from among them and add it
// to your hand. Put the rest on the bottom of your deck in any order.
import { defineCard, lookAtTopCards, spell } from "../helpers";
import { and, hasTrait, isFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 5, { filter: and(isFollower, hasTrait("妖怪")), to: "hand" });
      },
    }),
  ],
});
