// BP02-114 Unicorn Dancer Unica (Evolved) — 3/3.
// Strike: Give your leader {[defense]}+2.
import { defineCard, strike } from "../helpers";

export default defineCard({
  abilities: [
    strike({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
