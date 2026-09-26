// BP16-112 Olivia, Heroic Dark Angel (Evolved) — Neutral follower, 5/5. 堕天使.
// Ward.
// On Evolve - Select an enemy follower on the field and deal it 5 damage.
// On Super-Evolve - Give your leader {[defense]}+3. Recover 3 play points.
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
      },
    }),
    onSuperEvolve({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 3);
        yield* fx.recoverPlayPoints(3);
      },
    }),
  ],
});
