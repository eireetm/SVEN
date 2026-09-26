// BP18-T03 Adorn with Jewels — Runecraft spell token, 1. 透京・錬金術師・商人.
// For the rest of this turn, you may play cards from your banished zone. (A spell played from there goes to the cemetery —
// ruling; CR 1.3.1.)
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.allowPlayFromBanishedThisTurn();
      },
    }),
  ],
});
