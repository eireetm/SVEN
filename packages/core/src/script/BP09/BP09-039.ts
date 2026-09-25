// BP09-039 Mysterian Whitewyrm — Runecraft follower, 5/5. 学院・光輝. The front face of a double-faced
// evolved card; its back face is BP09-039_back Mysterian Blackwyrm (CR 2.14).
// Ward.
// On Evolve - Give your leader {[defense]}+3.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 3);
      },
    }),
  ],
});
