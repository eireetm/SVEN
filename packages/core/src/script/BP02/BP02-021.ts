// BP02-021 Amelia, Silver Paladin — Swordcraft follower, 4, 3/3.
// {[fanfare]} Choose one of the following. (1) Select a follower that costs 3 play points or less
// in your hand and put it onto your field. (2) Select an enemy follower on the field and deal it 4
// damage. (An option without a target cannot be chosen — ruling, CR 5.18.3.1.2.)
import { defineCard, fanfare } from "../helpers";
import { and, costAtMost, enemyFollower, inYourZone, isFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      modes: [
        {
          id: "1",
          label: "Put a follower costing 3 or less from your hand onto your field",
          targets: [inYourZone("hand", { filter: and(isFollower, costAtMost(3)) })],
          *resolve(fx) {
            yield* fx.putOntoField(fx.targets[0]!);
          },
        },
        {
          id: "2",
          label: "Deal 4 damage to an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 4);
          },
        },
      ],
    }),
  ],
});
