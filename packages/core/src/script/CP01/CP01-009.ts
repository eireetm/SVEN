// CP01-009 Marvelous Sunday — Forestcraft follower, 2, 2/3. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// {[fanfare]} Return another card on your field to its owner's hand: Give your leader {[defense]}+2. (Your own cards only —
// ruling; CR 10.4.7.4.)
import { returnAnotherFromYourField } from "../costs";
import { defineCard, fanfare, serveAbility } from "../helpers";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    fanfare({
      cost: returnAnotherFromYourField(),
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
