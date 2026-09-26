// BP10-114 Fallen Shot — Neutral spell, 1. 堕天使.
// Select an Angel follower in your cemetery and enemy follower on the field. Put them into their owners'
// EX areas. (Both are needed; a card whose owner's EX area is full stays where it is — rulings, CR
// 4.8.3.2.)
import { defineCard, spell } from "../helpers";
import { and, enemyFollower, hasTrait, inYourZone, isFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [inYourZone("cemetery", { filter: and(isFollower, hasTrait("天使")) }), enemyFollower()],
      *resolve(fx) {
        yield* fx.putIntoEx([...fx.targets[0]!, ...fx.targets[1]!]);
      },
    }),
  ],
});
