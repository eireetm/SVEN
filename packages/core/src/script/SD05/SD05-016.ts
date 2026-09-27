// SD05-016 Summon Bloodkin — Abysscraft spell, 1. 吸血鬼.
// Summon a Forest Bat token. Put a Forest Bat token into your EX area. (A full zone just gets none — ruling.)
import { defineCard, spell } from "../helpers";
import { BAT } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.summon([BAT]);
        yield* fx.tokensToEx([BAT]);
      },
    }),
  ],
});
