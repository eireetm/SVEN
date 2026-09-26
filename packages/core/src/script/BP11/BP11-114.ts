// BP11-114 Rivaylian Bandit (Evolved) — Neutral follower, 2/2. 荒野・傭兵.
// On Evolve - Select an enemy follower on the field and, if there are at least 2 Mount cards on your
// field and/or in your EX area, deal it 2 damage. (Both zones together — ruling.)
// Whenever this follower gains attack or defense, give it Storm. (A super-evolution's +1/+1 counts —
// ruling, CR 12.2.4.1.)
import { defineCard, onEvolve, whenThisGainsStats } from "../helpers";
import { enemyFollower } from "../targets";
import { mountsOnFieldAndEx } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (mountsOnFieldAndEx(fx.game, fx.controller) >= 2) yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
    whenThisGainsStats({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
  ],
});
