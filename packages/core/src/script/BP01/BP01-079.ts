// BP01-079 Aiela, Dragon Knight — Dragoncraft follower, 3, 3/2.
// Assail. // {[lastwords]} Increase your maximum play points by 1. (Never above 10 — ruling,
// CR 3.2.4.1.)
import { defineCard, lastWords } from "../helpers";

export default defineCard({
  keywords: ["assail"],
  abilities: [
    lastWords({
      *resolve(fx) {
        yield* fx.increaseMaxPlayPoints(1);
      },
    }),
  ],
});
