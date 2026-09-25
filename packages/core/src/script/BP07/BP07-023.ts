// BP07-023 Leod, the Crescent Blade (Evolved) — 2/4.
// On Evolve: Select an enemy leader or enemy follower on the field and deal it 2 damage.
// While this follower is reserved on your field, it has Intimidate and Aura.
// At the start of your end phase, select an enemy follower on the field and deal it 1 damage.
import { defineCard, onEvolve } from "../helpers";
import { enemyLeaderOrFollower } from "../targets";
import { leodEndPhase, leodKeywords } from "./shared";

export default defineCard({
  field: { keywordsFor: leodKeywords },
  abilities: [
    onEvolve({
      targets: [enemyLeaderOrFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
    leodEndPhase,
  ],
});
