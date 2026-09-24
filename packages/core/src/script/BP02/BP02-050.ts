// BP02-050 Magical Strategy — Runecraft spell, 1.
// Summon a Magical Pawn token.
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.summon(["Magical Pawn"]);
      },
    }),
  ],
});
