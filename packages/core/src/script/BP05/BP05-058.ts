// BP05-058 Disdainful Rending — Dragoncraft spell, 1. 絶傑・竜族.
// Select a follower on your field and an enemy follower on the field. Deal 1 damage to the first
// follower and 3 damage to the second. (Needs both — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower, yourFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [yourFollower(), enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamages([
          { target: fx.targets[0]![0]!, amount: 1 },
          { target: fx.targets[1]![0]!, amount: 3 },
        ]);
      },
    }),
  ],
});
