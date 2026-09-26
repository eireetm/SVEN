// BP11-049 Mirror Witch — Runecraft follower, 3, 2/3. 魔法使い.
// Storm.
// During each opponent's turn, whenever this follower takes damage, deal 2 damage to each enemy leader.
// (Also damage that destroys it; a 0-attack attacker deals none — rulings.)
import { defineCard, whenThisTakesDamage } from "../helpers";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    whenThisTakesDamage({
      triggerIf: (g, p) => g.activePlayer !== p,
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
      },
    }),
  ],
});
