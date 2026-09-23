// BP01-114 Phantom Howl — Abysscraft spell, 3.
// Summon 4 Ghost tokens.
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.summon(["Ghost", "Ghost", "Ghost", "Ghost"]);
      },
    }),
  ],
});
