// BP12-039 Regalore, Steel Chimera (Evolved) — Runecraft follower, 7/7. 機械・魔法生物・禁忌.
// Ward.
// On Evolve - Select an enemy follower on the field and return it to the owner's hand. Summon an Assembly
// Droid token and give it {[attack]}+X/{[defense]}+X, where X equals the selected follower's cost.
// (元のコスト; not played without a target — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { DROID } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const x = fx.game.card(target) ? (fx.game.info(target).cost ?? 0) : 0;
        yield* fx.returnToHand([target]);
        for (const droid of yield* fx.summon([DROID])) {
          if (x > 0) yield* fx.giveStats(droid, x, x);
        }
      },
    }),
  ],
});
