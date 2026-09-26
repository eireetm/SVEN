// BP13-011 Wildwood Warrior — Forestcraft follower, 5, 4/4. 狩人・獣.
// {[fanfare]} Look at the top 4 cards of your deck. You may reveal a Beast follower from among them and add
// it to your hand. Put the rest on the bottom of your deck in any order.
// Activate {[engage]}: You may summon a Beast follower that costs 4 or less from your hand. (元のコスト.)
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { and, costAtMost, isFollower } from "../targets";
import { beast } from "./shared";

const beastFollower = and(isFollower, beast);

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: beastFollower, to: "hand" });
      },
    }),
    activated(
      { engageSelf: true },
      {
        *resolve(fx) {
          const beasts = fx.game.cards(fx.controller, "hand").filter((id) => and(beastFollower, costAtMost(4))(fx.game, id));
          yield* fx.putOntoField(yield* fx.chooseCards(beasts, 0, 1));
        },
      },
    ),
  ],
});
