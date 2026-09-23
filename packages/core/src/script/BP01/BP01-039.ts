// BP01-039 Pompous Princess — Swordcraft follower, 3, 3/3.
// {[fanfare]} Look at the top 5 cards of your deck. You may put a follower that costs 1 play
// point from among them onto your field. Put the remaining cards on the bottom of your deck in
// any order. (CR 5.11; "may" — ruling.)
import { defineCard, fanfare } from "../helpers";
import { and, costAtMost, costAtLeast, isFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const top = fx.topCards(5);
        const oneCost = top.filter((id) => and(isFollower, costAtLeast(1), costAtMost(1))(fx.game, id));
        const chosen = yield* fx.selectCards(oneCost, 0, 1, fx.controller, top);
        if (chosen.length > 0) yield* fx.putOntoField(chosen);
        yield* fx.bottomInAnyOrder(top.filter((id) => fx.game.card(id)?.zone === "deck"));
      },
    }),
  ],
});
