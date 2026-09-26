// BP15-031 Serration Wave — Swordcraft spell, 1. 挑戦者・兵士.
// Choose up to 2. (1) Select an enemy follower on the field and deal it 2 damage. (2) Select a Kagemitsu, Lost
// Samurai on your field or in your EX area and place a fighting spirit counter on it. (Each option once, and each
// needs its target — rulings.)
import { defineCard, spell } from "../helpers";
import { enemyFollower, named, yourFieldOrEx } from "../targets";
import { KAGEMITSU, SPIRIT } from "./shared-sword";

export default defineCard({
  abilities: [
    spell({
      modeCount: () => 2,
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
          id: "spirit",
          label: "(2) A fighting spirit counter on a Kagemitsu",
          targets: [yourFieldOrEx({ filter: named(KAGEMITSU) })],
          *resolve(fx) {
            yield* fx.addCounters(fx.targets[0]![0]!, SPIRIT, 1);
          },
        },
      ],
    }),
  ],
});
