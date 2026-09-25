// BP09-112 Oceanus — Neutral follower, 1, 1/1. 大神・光輝.
// Whenever a follower on your field evolves, choose one of the following. (1) Select an enemy follower
// on the field and deal it 2 damage. (2) Give your leader {[defense]}+1. (Without a target (1) can't be
// chosen — ruling, CR 5.18.3.1.2. An evolved amulet is not a follower evolving.)
import { defineCard, whenYourFollowerEvolves } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    whenYourFollowerEvolves({
      modes: [
        {
          id: "damage",
          label: "(1) Deal 2 damage to an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 2);
          },
        },
        {
          id: "defense",
          label: "(2) Give your leader +1 defense",
          *resolve(fx) {
            yield* fx.giveLeaderDefense(fx.controller, 1);
          },
        },
      ],
    }),
  ],
});
