// BP02-084 Moriana the Bejeweled — Abysscraft follower, 3, 3/4.
// {[fanfare]} If Sanguine is active for you, give your leader {[defense]}+3 and draw a card.
// (CR 13.5.2)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      condition: (g, c) => g.sanguine(c),
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 3);
        yield* fx.draw(1);
      },
    }),
  ],
});
