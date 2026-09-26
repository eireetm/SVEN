// BP20-T11 Crest: Mjerrabaine, Great Manifest — Neutral crest token. 絶傑.
// At the start of your end phase, if there are 1 or less cards in your hand, draw a card. (Valid in the EX area, CR 10.3.6.)
import { atStartOfYourEndPhase, defineCard } from "../helpers";
import { oneOrLessInHand } from "./shared-neutral";

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        if (oneOrLessInHand(fx.game, fx.controller)) yield* fx.draw(1);
      },
    }),
  ],
});
