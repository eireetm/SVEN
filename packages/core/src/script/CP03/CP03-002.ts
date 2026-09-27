// CP03-002 Blue Storm Supreme Dragon, Glory Maelstrom (Evolved) — 4/4. (Evolved from CP03-001 by name.)
// Storm. Twin Drive.
// Whenever this follower deals damage to an enemy leader, select an enemy follower on the field. Destroy it and draw 2 cards.
// (An attack with 0 attack deals no damage — ruling.)
import { defineCard, whenThisDealsDamageToEnemyLeader } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["storm", "twinDrive"],
  abilities: [
    whenThisDealsDamageToEnemyLeader({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
        yield* fx.draw(2);
      },
    }),
  ],
});
