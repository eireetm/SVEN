// BP02-048 Grand Gargoyle — Runecraft follower, 3, 3/4.
// Ward.
// {[lastwords]} Add 2 to a Stack on your field. (CR 13.3.2.4; with no Stack card on your field a
// Magic Sediment with 2 Stack counters is summoned — ruling, rule change of 2026-07-31.)
import { defineCard, lastWords } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    lastWords({
      *resolve(fx) {
        yield* fx.addToStack(2);
      },
    }),
  ],
});
