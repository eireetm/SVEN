// BP01-115 Death's Breath — Abysscraft spell, 6.
// Select a follower that costs 8 play points or less in your cemetery. Put it onto your field
// and give it Ward. (The Ward stays through evolution but not after leaving the field — rulings.)
import { defineCard, spell } from "../helpers";
import { and, costAtMost, inYourZone, isFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [inYourZone("cemetery", { filter: and(isFollower, costAtMost(8)) })],
      *resolve(fx) {
        for (const id of yield* fx.putOntoField(fx.targets[0]!)) yield* fx.giveKeyword(id, "ward");
      },
    }),
  ],
});
