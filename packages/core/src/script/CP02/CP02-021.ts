// CP02-021 Rin Shibuya — Swordcraft follower, 4, 4/4. デレマス・クール.
// Ward.
// {[fanfare]} If there's a follower with "Uzuki Shimamura" in its name on your field, select an enemy follower on the field and
// deal it 5 damage.
// {[fanfare]} If there's a follower with "Mio Honda" in its name on your field, deal 5 damage to each enemy leader.
// (The two Fanfares resolve in the order the player chooses — ruling.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { damageEnemyLeader, nameOnYourField } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      condition: (g, c) => nameOnYourField(g, c, "Uzuki Shimamura"),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
      },
    }),
    fanfare({
      condition: (g, c) => nameOnYourField(g, c, "Mio Honda"),
      *resolve(fx) {
        yield* damageEnemyLeader(fx, 5);
      },
    }),
  ],
});
