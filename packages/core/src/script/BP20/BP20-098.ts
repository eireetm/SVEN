// BP20-098 Congregant of Repose (Evolved) — 4/4.
// On Evolve - Select an enemy follower on the field and deal damage to it equal to 2 times the number of crests in your EX
// area.
import { crestsInEx, defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const x = 2 * crestsInEx(fx.game, fx.controller);
        if (x > 0) yield* fx.dealDamage(fx.targets[0]![0]!, x);
      },
    }),
  ],
});
