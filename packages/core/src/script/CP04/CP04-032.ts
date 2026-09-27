// CP04-032 Tamaki (Evolved) — Swordcraft, 2/2. プリコネ・メルクリウス財団.
// {[ub]} Strike - Select an enemy follower on the field with at least 3 attack and deal it 2 damage.
// Storm.
import { defineCard, strike, ub } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    ub(
      strike({
        targets: [enemyFollower({ filter: (g, id) => (g.info(id).attack ?? 0) >= 3 })],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        },
      }),
    ),
  ],
});
