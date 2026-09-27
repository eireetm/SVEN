// CP03-047 Barking Manticore (Evolved) — 4/4. (Evolved from CP03-046, which names it.)
// Ward. Twin Drive.
// On Evolve - Select an enemy follower on the field and deal it 4 damage.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward", "twinDrive"],
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
  ],
});
