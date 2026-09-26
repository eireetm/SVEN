// BP15-082 Spiteful Screams — Abysscraft spell, 2. 絶傑・死霊術師.
// Necrocharge (10) - This costs 1 less to play. (CR 13.5.1.2.)
// ----------
// Select an {[abysscraft]} follower in your cemetery with {[lastwords]} that costs 2 or less and summon it.
// (元のコスト.)
import { defineCard, spell } from "../helpers";
import { and, costAtMost, hasLastWords, inYourZone, isClass, isFollower } from "../targets";

export default defineCard({
  playCost: (g, _self, p) => (g.necrocharge(p, 10) ? -1 : 0),
  abilities: [
    spell({
      targets: [inYourZone("cemetery", { filter: and(isFollower, isClass("Abysscraft"), hasLastWords, costAtMost(2)) })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
  ],
});
