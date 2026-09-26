// BP11-005 Terrorformer (Evolved) — Forestcraft follower, 0/6. 精霊.
// Storm.
// On Evolve - Select an enemy follower on the field and deal it damage equal to this follower's attack.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone !== "field") return;
        yield* fx.dealDamage(fx.targets[0]![0]!, fx.game.info(fx.self).attack ?? 0);
      },
    }),
  ],
});
