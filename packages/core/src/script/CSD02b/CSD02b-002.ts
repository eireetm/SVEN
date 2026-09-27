// CSD02b-002 Nao Kamiya [Over the Rainbow] — Swordcraft follower, 5, 3/3. デレマス・クール.
// {[fanfare]} Look at the top 5 cards of your deck. From among them, you may summon up to 2 Cool followers that cost a total of 4 or
// less. Put the rest on the bottom of your deck in any order. (元のコスト.)
import { defineCard, fanfare, selectWithinTotalCost } from "../helpers";
import { cool, followerThat } from "../CP02/shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const top = fx.topCards(5);
        const coolFollower = followerThat(cool);
        const chosen = yield* selectWithinTotalCost(fx, top.filter((id) => coolFollower(fx.game, id)), 4, 2, top);
        yield* fx.putOntoField(chosen);
        yield* fx.bottomInAnyOrder(top.filter((id) => fx.game.card(id)?.zone === "deck"));
      },
    }),
  ],
});
