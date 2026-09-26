// BP21-097 Lou, Lady-in-Training (Evolved) — 2/2.
// On Evolve - Select an enemy follower on the field and deal it damage equal to this follower's attack.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const attack = fx.game.card(fx.self)?.zone === "field" ? (fx.game.info(fx.self).attack ?? 0) : 0;
        if (attack > 0) yield* fx.dealDamage(fx.targets[0]![0]!, attack);
      },
    }),
  ],
});
