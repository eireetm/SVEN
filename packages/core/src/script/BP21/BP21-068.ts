// BP21-068 Ipupiara (Evolved) — 3/5.
// Assail. Bane.
// Strike - Deal 2 damage to each enemy leader.
import { defineCard, strike } from "../helpers";

export default defineCard({
  keywords: ["assail", "bane"],
  abilities: [
    strike({
      *resolve(fx) {
        yield* fx.dealDamageEach([fx.game.leader(fx.game.opponent(fx.controller))], 2);
      },
    }),
  ],
});
