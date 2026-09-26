// BP19-076 Garodeth, Insurgent Convict (Evolved) — 6/6.
// Storm.
// On Evolve - Select an enemy follower on the field and deal it 8 damage.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 8);
      },
    }),
  ],
});
