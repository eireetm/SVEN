// BP18-T04 Ginger's Curse — Runecraft spell token, 1. 魔法使い.
// Select an enemy follower on the field. It loses all abilities. Change its attack and defense to 1. (Traits stay; abilities
// given later work — rulings; CR 10.9.1.6.)
import { changeStatsTo, defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.loseAbilities(target, null);
        yield* changeStatsTo(fx, target, { attack: 1, defense: 1 });
      },
    }),
  ],
});
