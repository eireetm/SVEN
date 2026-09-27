// CP04-028 Tomo (Evolved) — Swordcraft, 3/2. プリコネ・NIGHTMARE.
// {[ub]} Strike - Select an enemy follower on the field and deal it 2 damage.
// Storm.
import { defineCard, strike, ub } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    ub(
      strike({
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        },
      }),
    ),
  ],
});
