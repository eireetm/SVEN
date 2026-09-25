// BP07-004 Primal Giant — Forestcraft follower, 9, 7/7. 自然・精霊.
// When this card is discarded, put a Naterran Great Tree token into your EX area. (Also when it
// is discarded for the hand limit — ruling.)
// When playing this card, bury 4 Natura cards: This card costs 4 less to play. (CR 10.4.7.3; cards
// on your field, so with a full field it can still be played — ruling.)
// {[fanfare]} Select a {[forestcraft]} follower that costs 5 or less in your cemetery and summon it.
// (元のコスト. Buried Naterran Great Trees' "leaves the field" abilities and this Fanfare are
// pending together and resolve in any order — ruling.)
import { buryFromYourField } from "../costs";
import { defineCard, fanfare, whenDiscarded } from "../helpers";
import { and, costAtMost, inYourZone, isClass, isFollower } from "../targets";
import { TREE, natura } from "./shared";

export default defineCard({
  playOptions: [
    {
      id: "bury4",
      label: "Bury 4 Natura cards on your field: costs 4 less",
      ...buryFromYourField(natura, 4),
      freesFieldSlots: 4,
      costDelta: -4,
    },
  ],
  abilities: [
    whenDiscarded({
      *resolve(fx) {
        yield* fx.tokensToEx([TREE]);
      },
    }),
    fanfare({
      targets: [inYourZone("cemetery", { filter: and(isFollower, isClass("Forestcraft"), costAtMost(5)) })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
  ],
});
