// BP13-097 Thornclad Arbiter — Havencraft follower, 3, 2/2. 信仰.
// Ward.
// {[fanfare]} Look at the top 5 cards of your deck. You may summon an amulet that costs 2 or less from among
// them. Put the rest on the bottom of your deck in any order. (元のコスト.)
// Activate {[engage]}: Select an amulet on your field and destroy it.
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { and, costAtMost, isAmulet, yourCardOnField } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 5, { filter: and(isAmulet, costAtMost(2)), to: "field" });
      },
    }),
    activated(
      { engageSelf: true },
      {
        targets: [yourCardOnField({ filter: isAmulet })],
        *resolve(fx) {
          yield* fx.destroy(fx.targets[0]!);
        },
      },
    ),
  ],
});
