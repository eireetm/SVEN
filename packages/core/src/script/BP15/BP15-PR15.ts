// BP15-PR15 Scream Diffusion — Abysscraft spell token, 2. 絶傑・死霊術師.
// Summon a Rulenye, Echoing Scream token for every 5 cards in your cemetery.
import { defineCard, spell } from "../helpers";
import { ECHOING_SCREAM } from "./shared-abyss";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const n = Math.floor(fx.game.cards(fx.controller, "cemetery").length / 5);
        if (n > 0) yield* fx.summon(Array<string>(n).fill(ECHOING_SCREAM));
      },
    }),
  ],
});
