// BP01-107 Mordecai the Duelist — Abysscraft follower, 5, 5/5.
// {[lastwords]} Give your leader -3 defense: Put this follower onto its owner's field.
// (Optional cost, CR 10.4.7.4; with a full field only the cost is paid — BP01-014 ruling.)
import { defineCard, lastWords } from "../helpers";
import { leaderDefenseCost } from "../costs";

export default defineCard({
  abilities: [
    lastWords({
      cost: leaderDefenseCost(3),
      *resolve(fx) {
        const me = fx.game.card(fx.self);
        if (me?.zone === "cemetery") yield* fx.putOntoField([fx.self], me.owner);
      },
    }),
  ],
});
