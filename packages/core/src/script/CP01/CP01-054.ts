// CP01-054 Maruzensky (Evolved) — 4/4.
// On Evolve: Select an enemy follower on the field and give it {[attack]}-2/{[defense]}-2.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, -2, -2);
      },
    }),
  ],
});
