// CP01-026 Fuji Kiseki — Swordcraft follower, 2, 3/2. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// {[act]} {[cost03]}, {[engage]}: Select an enemy follower on the field and deal it 3 damage.
import { activated, defineCard, serveAbility } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    activated(
      { playPoints: 3, engageSelf: true },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        },
      },
    ),
  ],
});
