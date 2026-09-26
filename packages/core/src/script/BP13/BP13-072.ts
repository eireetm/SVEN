// BP13-072 Aluzard, Timeworn Vampire (Evolved) — Abysscraft follower, 3/3. 荒野・吸血鬼.
// {[lastwords]} Put this card and a Blood Arts token into its owner's EX area. Place 2 dormancy counters on
// this card.
import { defineCard, lastWords } from "../helpers";
import { aluzardSleeps } from "./shared-abyss";

export default defineCard({
  abilities: [
    lastWords({
      *resolve(fx) {
        yield* aluzardSleeps(fx, true);
      },
    }),
  ],
});
