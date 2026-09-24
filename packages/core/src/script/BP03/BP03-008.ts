// BP03-008 Abby the Axe Girl — Forestcraft follower, 3, 3/4. 狩人.
// Strike: +1 attack. Then, if this follower has at least 5 attack, deal 2 to the enemy leader.
import { defineCard, strike } from "../helpers";

export default defineCard({
  abilities: [
    strike({
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 1, 0);
        if ((fx.game.info(fx.self).attack ?? 0) >= 5) {
          yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
        }
      },
    }),
  ],
});
