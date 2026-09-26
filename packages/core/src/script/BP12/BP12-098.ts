// BP12-098 Sol Sister (Evolved) — Havencraft follower, 5/5. 信仰.
// Ward.
// On Evolve - Select an enemy follower on the field and deal it X damage. X equals the number of amulets
// on your field plus 1.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower, isAmulet } from "../targets";
import { countIn } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, countIn(fx.game, fx.controller, "field", isAmulet) + 1);
      },
    }),
  ],
});
