// BP09-012 Grasshopper Conductor — Forestcraft follower, 3, 3/3. 精霊・虫族.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} If there are at least 5 {[forestcraft]} spells with different names in your cemetery,
// select an enemy follower on the field and deal it 4 damage.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { fiveForestSpellNames } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyFollower({ when: fiveForestSpellNames })],
      *resolve(fx) {
        const target = fx.targets[0]?.[0];
        if (target !== undefined) yield* fx.dealDamage(target, 4);
      },
    }),
  ],
});
