// BP20-014 Bearer of the Fairy Blade (Evolved) — 3/3.
// Whenever you summon a Pixie token follower, give it {[attack]}+1.
// On Evolve - Select an enemy follower on the field and deal it 2 damage.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { fairyBladeBoost } from "./shared-forest";

export default defineCard({
  abilities: [
    fairyBladeBoost,
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
