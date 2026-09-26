// BP16-062 Liu Feng, Goldennote Ward (Evolved) — Dragoncraft follower, 4/4. 竜使い・ドラゴニュート.
// On Evolve - Select an enemy follower on the field and deal it 3 damage.
// On Super-Evolve - Increase your max play points by 1. Give your leader {[defense]}+2.
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
    onSuperEvolve({
      *resolve(fx) {
        yield* fx.increaseMaxPlayPoints(1);
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
