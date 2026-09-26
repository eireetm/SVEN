// BP19-108 Luminescent Gem — Havencraft amulet, 0. 光輝.
// {[lastwords]} Give your leader {[defense]}+1.
import { defineCard, lastWords } from "../helpers";

export default defineCard({
  abilities: [
    lastWords({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
