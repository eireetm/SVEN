// BP04-024 Barbarossa (Evolved) — Swordcraft, 7/6.
// Assail.
// {[lastwords]} Put this card into its owner's EX area. (The evolved card goes back to the evolve
// deck; the base card goes to the EX area — ruling.)
import { defineCard, lastWords } from "../helpers";

export default defineCard({
  keywords: ["assail"],
  abilities: [
    lastWords({
      *resolve(fx) {
        yield* fx.putIntoEx([fx.self]);
      },
    }),
  ],
});
