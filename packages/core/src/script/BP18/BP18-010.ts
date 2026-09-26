// BP18-010 Verdant City Pugilist (Evolved) — 2/2.
// You may play any number of Evolve per turn. (CR 8.3.2.2.)
// On Evolve - Select an enemy leader or enemy follower on the field and deal it 1 damage.
// Whenever a follower on your field evolves, select a Togh Keyoh follower on your field and give it
// {[attack]}+1/{[defense]}+1.
import { defineCard, onEvolve } from "../helpers";
import { enemyLeaderOrFollower } from "../targets";
import { pugilistBoost } from "./shared-forest";

export default defineCard({
  field: { unlimitedEvolve: true },
  abilities: [
    onEvolve({
      targets: [enemyLeaderOrFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 1);
      },
    }),
    pugilistBoost,
  ],
});
