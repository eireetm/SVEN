// BP12-110 Giving Gourmet — Neutral follower, 4, 4/4. コック.
// {[fanfare]} Give your leader {[defense]}+3.
// {[lastwords]} Choose one. (1) Search your deck for a Chef follower that costs 3 or less, summon it, then
// shuffle. (2) Draw a card.
import { defineCard, fanfare, lastWords } from "../helpers";
import { and, costAtMost, hasTrait, isFollower } from "../targets";

const cheapChef = and(isFollower, hasTrait("コック"), costAtMost(3));

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 3);
      },
    }),
    lastWords({
      modes: [
        {
          id: "chef",
          label: "(1) Summon a Chef follower that costs 3 or less from your deck",
          *resolve(fx) {
            yield* fx.search((id) => cheapChef(fx.game, id), { to: "field" });
          },
        },
        {
          id: "draw",
          label: "(2) Draw a card",
          *resolve(fx) {
            yield* fx.draw(1);
          },
        },
      ],
    }),
  ],
});
