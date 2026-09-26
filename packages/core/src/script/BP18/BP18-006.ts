// BP18-006 Verdant Authority Caretaker (Evolved) — 2/3.
// You may play any number of Evolve per turn. (CR 8.3.2.2.)
// Whenever a follower on your field evolves, give your leader {[defense]}+1.
import { defineCard, whenYourFollowerEvolves } from "../helpers";

export default defineCard({
  field: { unlimitedEvolve: true },
  abilities: [
    whenYourFollowerEvolves({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
