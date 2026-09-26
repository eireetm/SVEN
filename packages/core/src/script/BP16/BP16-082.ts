// BP16-082 Ceres, Blue Rose Maiden — Abysscraft follower, 2, 1/3. 死者.
// Bane.
// Necrocharge (5) - This has Storm. (CR 13.5.1.2.)
// During your turn, whenever this deals damage to an enemy leader, each opponent discards a card. (Not with 0 attack —
// ruling.)
import { defineCard, whenThisDealsDamageToEnemyLeader } from "../helpers";

export default defineCard({
  keywords: ["bane"],
  selfKeywords: (g, self) => (g.necrocharge(g.controller(self), 5) ? ["storm"] : []),
  abilities: [
    whenThisDealsDamageToEnemyLeader(
      {
        *resolve(fx) {
          yield* fx.discard(fx.game.opponent(fx.controller), 1, 1);
        },
      },
      { onlyYourTurn: true },
    ),
  ],
});
