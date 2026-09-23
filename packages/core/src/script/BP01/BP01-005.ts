// BP01-005 Rhinoceroach (Evolved) — 1/1.
// On Evolve: Choose one of the following effects. (1) Give this follower Storm. (2) Select an
// enemy follower on the field and deal it X damage. X equals this follower's attack.
// (2) cannot be chosen without a target (ruling, CR 5.18.3.1.2); X is the current attack.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      modes: [
        {
          id: "1",
          label: "Give this follower Storm",
          *resolve(fx) {
            yield* fx.giveKeyword(fx.self, "storm");
          },
        },
        {
          id: "2",
          label: "Deal X damage to an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, fx.game.info(fx.self).attack ?? 0);
          },
        },
      ],
    }),
  ],
});
