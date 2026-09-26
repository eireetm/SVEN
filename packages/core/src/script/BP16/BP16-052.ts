// BP16-052 Emmylou, Witch of Wonder — Runecraft follower, 2, 2/3. 魔法使い.
// {[fanfare]} Choose 1. (1) Summon a Magic Sediment token. (2) Earth Rite: Select an enemy follower on the field and
// deal it 3 damage. ((2) needs its target — ruling; its Earth Rite is optional, CR 13.3.3.2, Q7.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { MAGIC_SEDIMENT } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      modes: [
        {
          id: "sediment",
          label: "(1) A Magic Sediment",
          *resolve(fx) {
            yield* fx.summon([MAGIC_SEDIMENT]);
          },
        },
        {
          id: "damage",
          label: "(2) Earth Rite: 3 damage to an enemy follower",
          earthRite: true,
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 3);
          },
        },
      ],
    }),
  ],
});
