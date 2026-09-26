// BP21-086 Bonebreaker Bladesman (Evolved) — 4/6.
// Assail.
// Follower Strike - Deal each enemy leader damage equal to this follower's attack.
// On Evolve - Select an enemy follower on the field and deal it 4 damage.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { bonebreakerStrike } from "./shared-abyss";

export default defineCard({
  keywords: ["assail"],
  abilities: [
    bonebreakerStrike,
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
  ],
});
