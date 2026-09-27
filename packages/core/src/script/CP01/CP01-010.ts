// CP01-010 Yukino Bijin — Forestcraft follower, 3, 3/3. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// Ward.
// {[fanfare]} Return another card on your field to its owner's hand: Give this follower {[attack]}+1/{[defense]}+1. (Your own
// cards only — ruling.)
import { returnAnotherFromYourField } from "../costs";
import { defineCard, fanfare, serveAbility } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    serveAbility(1, 1),
    fanfare({
      cost: returnAnotherFromYourField(),
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
  ],
});
