// BP13-041 Mileka, Celestial Seer (Evolved) — Runecraft follower, 2/2. 錬金術師・星神.
// Ward.
// On Evolve - Select an enemy follower on the field. If there are at least 6 cards with different base
// costs in your cemetery, deal it 4 damage, draw 2 cards, then discard a card. (All under the condition;
// not played without a target — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { distinctCostsInCemetery } from "../BP11/shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (distinctCostsInCemetery(fx.game, fx.controller) < 6) return;
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        yield* fx.draw(2);
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
  ],
});
