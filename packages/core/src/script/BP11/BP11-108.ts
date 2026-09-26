// BP11-108 Embodiment of Cocytus — Neutral spell, 2. 魔王.
// Choose one. (1) Search your deck for an Archfiend card, reveal it, add it to your hand, then shuffle.
// (2) Select an enemy follower on the field. Destroy it and deal 3 damage to your leader.
import { defineCard, spell } from "../helpers";
import { enemyFollower, hasTrait } from "../targets";

export default defineCard({
  abilities: [
    spell({
      modes: [
        {
          id: "search",
          label: "(1) Search for an Archfiend card",
          *resolve(fx) {
            yield* fx.search((id) => hasTrait("魔王")(fx.game, id));
          },
        },
        {
          id: "destroy",
          label: "(2) Destroy an enemy follower, 3 damage to your leader",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.destroy(fx.targets[0]!);
            yield* fx.dealDamage(fx.game.leader(fx.controller), 3);
          },
        },
      ],
    }),
  ],
});
