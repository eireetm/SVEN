// SD02-001 Tsubaki — Swordcraft follower, 6, 5/4. 暗殺者・忍者.
// {[fanfare]} Choose one of the following effects: (1) Select an enemy follower on the field and destroy it. (2) Give this follower
// Storm. ((1) can't be chosen without a follower to select — ruling, CR 5.18.3.1.2.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      modes: [
        {
          id: "1",
          label: "Destroy an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.destroy(fx.targets[0]!);
          },
        },
        {
          id: "2",
          label: "Give this follower Storm",
          *resolve(fx) {
            yield* fx.giveKeyword(fx.self, "storm");
          },
        },
      ],
    }),
  ],
});
