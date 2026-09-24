// BP02-057 Draconic Fervor — Dragoncraft spell, 5.
// Increase your maximum play points by 1. Give your leader {[defense]}+3. Draw a card.
// (Current play points do not increase — ruling; CR 3.2.4.)
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.increaseMaxPlayPoints(1);
        yield* fx.giveLeaderDefense(fx.controller, 3);
        yield* fx.draw(1);
      },
    }),
  ],
});
