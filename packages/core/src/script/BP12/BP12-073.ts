// BP12-073 Jackshovel Gravedigger (Evolved) — Abysscraft follower, 1/2. 機械・死霊術師.
// Bane.
// On Evolve - Summon an Assembly Droid token. Bury the top card of your deck.
import { defineCard, onEvolve } from "../helpers";
import { DROID } from "./shared";

export default defineCard({
  keywords: ["bane"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon([DROID]);
        yield* fx.mill(1);
      },
    }),
  ],
});
