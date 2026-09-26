// BP16-084 Orthrus, Hellhound Blader (Evolved) — Abysscraft follower, 3/3. 魔界.
// On Evolve - Choose 1. (1) Select an enemy follower on the field. Necrocharge (10) - Deal it 5 damage. (2) Bury the
// top 2 cards of your deck. ((1) needs its target — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      modes: [
        {
          id: "damage",
          label: "(1) An enemy follower; Necrocharge (10): 5 damage",
          targets: [enemyFollower()],
          *resolve(fx) {
            if (fx.game.necrocharge(fx.controller, 10)) yield* fx.dealDamage(fx.targets[0]![0]!, 5);
          },
        },
        {
          id: "bury",
          label: "(2) Bury the top 2 cards of your deck",
          *resolve(fx) {
            yield* fx.mill(2);
          },
        },
      ],
    }),
  ],
});
