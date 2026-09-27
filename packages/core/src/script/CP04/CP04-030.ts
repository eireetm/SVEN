// CP04-030 Ruka — Swordcraft follower, 2, 3/3. プリコネ・トワイライトキャラバン.
// {[ub]} Activate {[cost01]}, engage this: Select an enemy follower on the field and deal it 2 damage.
// Ward.
import { activated, defineCard, ub } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    ub(
      activated(
        { playPoints: 1, engageSelf: true },
        {
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 2);
          },
        },
      ),
    ),
  ],
});
