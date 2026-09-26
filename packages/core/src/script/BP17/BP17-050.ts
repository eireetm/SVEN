// BP17-050 Awakened Robot (Evolved) — Runecraft follower, 3/3. 機械・自然・ゴーレム.
// On Evolve - Select an enemy follower on the field and deal it 2 damage.
// {[lastwords]} Put a Repair Mode token into your EX area.
import { defineCard, lastWords, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { REPAIR } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.tokensToEx([REPAIR]);
      },
    }),
  ],
});
