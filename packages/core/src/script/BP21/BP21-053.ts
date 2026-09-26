// BP21-053 Aqueous Sphere — Runecraft spell, 3. 魔法使い.
// {[quick]}
// Spellchain (10) - This costs 2 less to play. (CR 13.3.1.)
// Select an enemy follower on the field and deal it 4 damage.
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  playCost: (g, _self, controller) => (g.spellchain(controller, 10) ? -2 : 0),
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
  ],
});
