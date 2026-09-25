// BP07-105 Viridia Magna (Evolved) — 4/4.
// Ward.
// {[lastwords]} Give your leader {[defense]}+2.
import { defineCard, lastWords } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    lastWords({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
