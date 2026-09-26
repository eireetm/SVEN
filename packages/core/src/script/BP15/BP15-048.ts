// BP15-048 Adherent of Elimination (Evolved) — Runecraft follower, 3/3. 絶傑・魔法使い.
// On Evolve - Choose 1. (1) Select an enemy follower on the field and deal it 2 damage. (2) Search your deck for a
// follower with "Raio" in its name, reveal it, add it to your hand, then shuffle. ((1) needs its target — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { and, enemyFollower, isFollower, nameIncludes } from "../targets";

const raio = and(isFollower, nameIncludes("Raio"));

export default defineCard({
  abilities: [
    onEvolve({
      modes: [
        {
          id: "damage",
          label: "(1) 2 damage to an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 2);
          },
        },
        {
          id: "raio",
          label: "(2) A Raio follower from your deck",
          *resolve(fx) {
            yield* fx.search((id) => raio(fx.game, id));
          },
        },
      ],
    }),
  ],
});
