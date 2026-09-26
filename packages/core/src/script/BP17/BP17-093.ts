// BP17-093 Yuwan, Dimensional Avenger — Havencraft follower, 2, 2/2. 超克.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Look at the top 2 cards of your deck. You may put a follower from among them into your EX area. Put the rest
// on the bottom of your deck in any order. If you put a follower into your EX area this way, discard a card.
import { defineCard, evolveAbility, fanfare, lookAtTopCards } from "../helpers";
import { isFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        const put = yield* lookAtTopCards(fx, 2, { filter: isFollower, to: "ex" });
        if (put.length > 0) yield* fx.discard(fx.controller, 1, 1);
      },
    }),
  ],
});
