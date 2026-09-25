// BP07-026 Troya, Thunder of Hagelberg (Evolved) — 3/3.
// Bane.
// On Evolve - Select an enemy follower on the field and deal it 2 damage. If there are at least 2
// Assassin followers in your cemetery, destroy it instead.
import { defineCard, onEvolve } from "../helpers";
import { and, enemyFollower, hasTrait, isFollower } from "../targets";
import { countIn } from "./shared";

export default defineCard({
  keywords: ["bane"],
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        if (countIn(fx.game, fx.controller, "cemetery", and(isFollower, hasTrait("暗殺者"))) >= 2) yield* fx.destroy([target]);
        else yield* fx.dealDamage(target, 2);
      },
    }),
  ],
});
