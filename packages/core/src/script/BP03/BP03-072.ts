// BP03-072 Armor Burst — Dragoncraft spell, 1. 竜族・武装.
// Select an Armed follower on your field and an enemy follower. Put the first into its owner's
// EX area, deal 3 to the second, and summon a Draconic Weapon.
// Both targets are required (ruling). A full EX area leaves the follower on the field (CR 4.8.3.2).
import { defineCard, spell } from "../helpers";
import { enemyFollower, hasTrait, yourFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [yourFollower({ filter: hasTrait("武装") }), enemyFollower()],
      *resolve(fx) {
        const yours = fx.targets[0] ?? [];
        const enemy = fx.targets[1]?.[0];
        if (yours.length > 0) yield* fx.putIntoEx(yours);
        if (enemy) yield* fx.dealDamage(enemy, 3);
        yield* fx.summon(["Draconic Weapon"]);
      },
    }),
  ],
});
