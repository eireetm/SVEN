// BP03-066 Draconic Smash — Dragoncraft spell, 2. ドラゴニュート・竜族・武装. Quick.
// Select an enemy follower. Deal it 3 and summon a Draconic Weapon.
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        yield* fx.summon(["Draconic Weapon"]);
      },
    }),
  ],
});
