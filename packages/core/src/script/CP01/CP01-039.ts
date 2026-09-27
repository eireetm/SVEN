// CP01-039 Narita Top Road — Runecraft follower, 3, 3/3. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// On Race: Give this follower {[attack]}+1/{[defense]}+1. Draw 2 cards, then discard a card.
import { defineCard, onRace, serveAbility } from "../helpers";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    onRace({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 1);
        yield* fx.draw(2);
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
  ],
});
