// BP07-054 Neptune, Tidemistress — Dragoncraft follower, 7, 6/6. 竜使い・海洋.
// Ward.
// {[fanfare]} Look at the top 5 cards of your deck. From among them, you may reveal up to 2 Marine
// followers not named Neptune, Tidemistress and add them to your hand. Put the rest on the bottom of
// your deck in any order. You may summon a Marine follower that costs 5 or less from your hand and
// give it {[attack]}+2/{[defense]}+2. (元のコスト.)
import { defineCard, fanfare, lookAtTopCards } from "../helpers";
import { and, costAtMost, isFollower, named } from "../targets";
import { marine } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        const notNeptune = and(isFollower, marine, (g, id) => !named("Neptune, Tidemistress")(g, id));
        yield* lookAtTopCards(fx, 5, { filter: notNeptune, to: "hand", max: 2 });
        const inHand = fx.game.cards(fx.controller, "hand").filter((id) => and(isFollower, marine, costAtMost(5))(fx.game, id));
        const [pick] = yield* fx.chooseCards(inHand, 0, 1);
        if (pick === undefined) return;
        const [summoned] = yield* fx.putOntoField([pick]);
        if (summoned !== undefined) yield* fx.giveStats(summoned, 2, 2);
      },
    }),
  ],
});
