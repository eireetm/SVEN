// BP14-005 Bastion of Seasons (Evolved) — Forestcraft follower, 3/5. 精霊・植物族.
// While this has 3 seasonal counters or less, it can't attack enemies.
// On Evolve - Select an enemy follower on the field and deal it 4 damage.
// At the start of your end phase, select a follower on the field. Give it {[attack]}+X/{[defense]}+X or deal
// it X damage, and place a seasonal counter on this. X equals this follower's attack.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { seasonsCantAttack, seasonsEndPhase } from "./shared-forest";

export default defineCard({
  cannotAttack: seasonsCantAttack,
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
    seasonsEndPhase,
  ],
});
