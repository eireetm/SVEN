// BP01-060 Spectral Wizard (Evolved) — 3/3.
// On Evolve, discard a spell: Select an enemy follower on the field and deal it 4 damage.
import { defineCard, onEvolve } from "../helpers";
import { discardA } from "../costs";
import { enemyFollower, isSpell } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      cost: discardA(isSpell),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
  ],
});
