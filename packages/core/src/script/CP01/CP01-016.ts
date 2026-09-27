// CP01-016 Narita Brian — Swordcraft follower, 8, 6/8. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// Bane. Ward. Aura.
// Activate {[engage]}: Select an enemy leader or enemy follower on the field and deal it 5 damage.
import { activated, defineCard, serveAbility } from "../helpers";
import { enemyLeaderOrFollower } from "../targets";

export default defineCard({
  keywords: ["bane", "ward", "aura"],
  abilities: [
    serveAbility(1, 1),
    activated(
      { engageSelf: true },
      {
        targets: [enemyLeaderOrFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 5);
        },
      },
    ),
  ],
});
