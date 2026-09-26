// BP11-044 Golem Marshal — Runecraft follower, 9, 5/7. 荒野・ゴーレム・魔法生物.
// When this card is discarded, put an Arcane Personnel Carrier token into your EX area. (Also at the
// hand limit — ruling.)
// ----------
// {[fanfare]} Select a Wasteland follower that costs 6 or less in your cemetery. Summon it, then summon
// an Arcane Personnel Carrier token. (The selected follower first, so a field it fills gets no
// Carrier; without such a follower the Fanfare isn't played — rulings.)
import { defineCard, fanfare, whenDiscarded } from "../helpers";
import { and, costAtMost, inYourZone } from "../targets";
import { CARRIER, wastelandFollower } from "./shared";

export default defineCard({
  abilities: [
    whenDiscarded({
      *resolve(fx) {
        yield* fx.tokensToEx([CARRIER]);
      },
    }),
    fanfare({
      targets: [inYourZone("cemetery", { filter: and(wastelandFollower, costAtMost(6)) })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
        yield* fx.summon([CARRIER]);
      },
    }),
  ],
});
