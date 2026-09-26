// BP11-084 Grudge Teller — Abysscraft follower, 2, 3/2. 死霊術師.
// {[fanfare]} Deal 1 damage to each enemy leader. If Sanguine is active for you, deal 3 damage instead.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), fx.game.sanguine(fx.controller) ? 3 : 1);
      },
    }),
  ],
});
