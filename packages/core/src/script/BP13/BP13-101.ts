// BP13-101 Prismawing Featherfolk — Havencraft follower, 2, 2/3. 信仰・鳥族.
// {[fanfare]} Discard a card: Look at the top 4 cards of your deck. You may reveal a spell or amulet from
// among them and add it to your hand. Put the rest on the bottom of your deck in any order.
import { discardCardsCost } from "../costs";
import { defineCard, fanfare, lookAtTopCards } from "../helpers";
import { isAmulet, isSpell } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      cost: discardCardsCost(1),
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: (g, id) => isSpell(g, id) || isAmulet(g, id), to: "hand" });
      },
    }),
  ],
});
