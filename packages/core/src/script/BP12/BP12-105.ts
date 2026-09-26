// BP12-105 Changewing Cherub (Evolved) — Neutral follower, 2/2. 機械・自然・天使.
// On Evolve - Select an enemy follower on the field and, if there are at least 5 Machina cards and/or
// Natura cards on your field and/or in your EX area, deal it 2 damage. (All counted together — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { machina, natura, onFieldAndEx } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (onFieldAndEx(fx.game, fx.controller, (g, id) => machina(g, id) || natura(g, id)) >= 5) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        }
      },
    }),
  ],
});
