// BP17-103 Unlikely Fellowship — Havencraft spell, 1. 自然・光輝・獣.
// Choose 1. (1) Select an enemy follower on the field and deal it 2 damage. (2) Select a follower in your cemetery with
// "Meowskers" in its name and summon it. (Not playable if neither can select its target — ruling, CR 5.18.)
import { defineCard, spell } from "../helpers";
import { and, enemyFollower, inYourZone, isFollower, nameIncludes } from "../targets";

export default defineCard({
  abilities: [
    spell({
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
          id: "summon",
          label: "(2) A Meowskers follower from your cemetery onto the field",
          targets: [inYourZone("cemetery", { filter: and(isFollower, nameIncludes("Meowskers")) })],
          *resolve(fx) {
            yield* fx.putOntoField(fx.targets[0]!);
          },
        },
      ],
    }),
  ],
});
