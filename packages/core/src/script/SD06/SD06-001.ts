// SD06-001 Skullfane — Havencraft follower, 7, 6/6. 狂信・偶像.
// {[fanfare]} Look at the top 4 cards of your deck. You may reveal an amulet from among them and put it onto your field. Put the
// remaining cards into your cemetery.
// Whenever an amulet you control leaves the field, deal 2 damage to each enemy leader and enemy follower on the field. (Once for
// each amulet; also when this leaves the field with it — rulings, CR 10.7.4.2.)
// (The scraped English says "put it into your hand"; the Japanese, Chinese and official English texts say "onto your field", and
// it is implemented so.)
import { defineCard, fanfare, lookAtTopCards, whenYourCardLeaves } from "../helpers";
import { isAmulet } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: isAmulet, to: "field", rest: "cemetery" });
      },
    }),
    whenYourCardLeaves(
      {
        *resolve(fx) {
          const opp = fx.game.opponent(fx.controller);
          yield* fx.dealDamageEach([fx.game.leader(opp), ...fx.game.followers(opp)], 2);
        },
      },
      { filter: (m) => m.before?.type === "amulet" },
    ),
  ],
});
