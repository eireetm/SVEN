// BP04-096 Scorpius — Abysscraft follower, 2, 2/2. 魔界・星神.
// Bane.
// Strike: Deal 1 damage to each leader (yours too — ruling).
import { defineCard, strike } from "../helpers";

export default defineCard({
  keywords: ["bane"],
  abilities: [
    strike({
      *resolve(fx) {
        yield* fx.dealDamages([
          { target: fx.game.leader(fx.controller), amount: 1 },
          { target: fx.game.leader(fx.game.opponent(fx.controller)), amount: 1 },
        ]);
      },
    }),
  ],
});
