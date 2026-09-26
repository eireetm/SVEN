// BP16-047 Penelope, Potions Prodigy (Evolved) — Runecraft follower, 3/3. 錬金術師.
// On Evolve - Give your leader {[defense]}+2. Add 1 to a Stack on your field.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
        yield* fx.addToStack(1);
      },
    }),
  ],
});
