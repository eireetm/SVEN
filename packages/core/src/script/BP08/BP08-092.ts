// BP08-092 Vengeful Radiance — Havencraft spell, 2. 狂信・キラー. Quick.
// It cannot be played during your turn. Select up to 2 enemy followers and divide 4 damage among
// them; every selected follower gets at least 1 (CR 8.1.2, 10.6.2.3.2, 10.6.2.4).
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  playableIf: (g, _self, player) => g.activePlayer !== player,
  abilities: [
    spell({
      targets: [enemyFollower({ count: 2, upTo: true, max: () => 4 })],
      *resolve(fx) { yield* fx.dealDividedDamage(fx.targets[0] ?? [], 4); },
    }),
  ],
});
