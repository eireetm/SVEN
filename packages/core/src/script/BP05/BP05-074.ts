// BP05-074 Apostle of Silence (Evolved) — Abysscraft follower, 5/5. 絶傑・死霊術師.
// On Evolve: Select an enemy follower on the field and deal it 3 damage. If there are 3 cards or
// less in its controller's hand, destroy it instead.
// At the start of your end phase, select an enemy leader. If there are 3 cards or less in its
// controller's hand, deal it 3 damage.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { silenceAtEndPhase } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        if (fx.game.cards(fx.game.controller(target), "hand").length <= 3) yield* fx.destroy([target]);
        else yield* fx.dealDamage(target, 3);
      },
    }),
    silenceAtEndPhase,
  ],
});
