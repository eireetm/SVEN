// SD05-013 Lilith (Evolved) — 3/3.
// Strike: Give your leader {[defense]}+2. (Also above 20 — ruling.)
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
