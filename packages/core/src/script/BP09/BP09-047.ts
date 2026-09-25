// BP09-047 Witch of Foresight (Evolved) — Runecraft follower, 2/4. 魔法使い.
// On Evolve - Look at the top card of your deck. You may bury it. Draw a card. (If it stays on top,
// that card is drawn — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { lookAtTopMayBury } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopMayBury(fx);
        yield* fx.draw(1);
      },
    }),
  ],
});
