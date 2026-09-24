// BP05-046 Disciple of Truth — Runecraft follower, 2, 2/2. 絶傑・魔法使い.
// Whenever you play a Mage card, give your leader {[defense]}+1. (Not for itself: it is not on the
// field when played — ruling.)
import { defineCard, whenYouPlay } from "../helpers";
import { hasTrait } from "../targets";

export default defineCard({
  abilities: [
    whenYouPlay(
      {
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 1);
        },
      },
      hasTrait("魔法使い"),
    ),
  ],
});
