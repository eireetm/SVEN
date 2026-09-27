// CP01-033 Agnes Digital — Runecraft follower, 1, 2/1. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// On Race: Draw a card, then discard a card.
import { defineCard, onRace, serveAbility } from "../helpers";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    onRace({
      *resolve(fx) {
        yield* fx.draw(1);
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
  ],
});
