// BP09-T02 Eternal Potion — Runecraft spell token, 2. 錬金術師・禁忌.
// Select a {[runecraft]} follower that costs 3 or less in your cemetery and summon it. Give it Rush and
// "At the start of your end phase, destroy this card." (元のコスト. It is put onto the field from the
// cemetery, e.g. for BP07-038 — ruling; it is still in the cemetery when this is played, so its own
// "when you play a spell" doesn't trigger — ruling.)
import { defineCard, spell } from "../helpers";
import { and, costAtMost, inYourZone, isClass, isFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [inYourZone("cemetery", { filter: and(isClass("Runecraft"), isFollower, costAtMost(3)) })],
      *resolve(fx) {
        for (const id of yield* fx.putOntoField(fx.targets[0]!)) {
          yield* fx.giveKeyword(id, "rush");
          yield* fx.grant(id, "destroyAtEnd");
        }
      },
    }),
  ],
});
