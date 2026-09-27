// CP01-006 Shinko Windy — Forestcraft follower, 1, 2/1. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// {[fanfare]} Look at the top card of your deck. You may put it on the bottom of your deck.
import { defineCard, fanfare, serveAbility } from "../helpers";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    fanfare({
      *resolve(fx) {
        const top = fx.topCards(1);
        if (top.length === 0) return;
        yield* fx.lookAt(top);
        if (yield* fx.confirm()) yield* fx.putOnDeck(top, "bottom");
      },
    }),
  ],
});
