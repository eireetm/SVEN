// BP04-118 Israfil (Evolved) — Neutral, 10/10.
// Strike: Deal 5 damage to each enemy follower on the field.
import { defineCard, strike } from "../helpers";

export default defineCard({
  abilities: [
    strike({
      *resolve(fx) {
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 5);
      },
    }),
  ],
});
