// BP11-086 Selena, Sugarkiss Assassin — Havencraft follower, 4, 2/2. 荒野・信仰・狂信.
// Storm.
// {[fanfare]} Look at the top 4 cards of your deck. From among them, you may put up to 1 Wasteland card
// and up to 1 follower that costs 2 or less into your EX area. Put the rest on the bottom of your deck
// in any order. (Either one alone is fine — ruling.)
// Strike - Recover 2 play points.
import { defineCard, fanfare, strike } from "../helpers";
import { and, costAtMost, isFollower } from "../targets";
import { wasteland } from "./shared";

const cheapFollower = and(isFollower, costAtMost(2));

export default defineCard({
  keywords: ["storm"],
  abilities: [
    fanfare({
      *resolve(fx) {
        const top = fx.topCards(4);
        const first = yield* fx.selectCards(top.filter((id) => wasteland(fx.game, id)), 0, 1, fx.controller, top);
        const second = yield* fx.selectCards(
          top.filter((id) => !first.includes(id) && cheapFollower(fx.game, id)),
          0,
          1,
          fx.controller,
          top,
        );
        yield* fx.putIntoEx([...first, ...second]);
        yield* fx.bottomInAnyOrder(top.filter((id) => fx.game.card(id)?.zone === "deck"));
      },
    }),
    strike({
      *resolve(fx) {
        yield* fx.recoverPlayPoints(2);
      },
    }),
  ],
});
