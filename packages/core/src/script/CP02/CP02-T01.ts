// CP02-T01 Magical Item — Neutral spell token, 4. デレマス. (CP02-T01–T09, CSD02a–c-T01: Cute Earrings, Cool Pendant, … are
// alternate names of the card named Magical Item, CR 14.3.1.1.)
// Give your leader {[defense]}+1. Draw a card.
// ----------
// (At the start of the game, if your deck is based on the THE IDOLM@STER CINDERELLA GIRLS universe, put 5 Magical Item tokens
// into your EX area.) (CR 14.3.1.2, done by the engine; it can be played from the EX area for 4 play points — ruling.)
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
        yield* fx.draw(1);
      },
    }),
  ],
});
