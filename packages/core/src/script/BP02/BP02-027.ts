// BP02-027 Yurius, Levin Duke — Swordcraft follower, 2, 0/4.
// {[q]}{[act]}{[engage]}: Select an enemy follower on the field and deal it 1 damage.
// ({[q]}: the ability can be activated at Quick timing, CR 12.3.3; the card itself is not Quick —
// rulings.)
import { activated, defineCard } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true },
      {
        quick: true,
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 1);
        },
      },
    ),
  ],
});
