// BP09-034 Frontline Ramparts — Swordcraft amulet, 2. 兵士.
// {[q]}{[act]} {[engage]}, bury this card: Select an enemy follower on the field and deal it 3 damage.
// (effect_en omits the engage icon; the official English and Japanese texts have it.)
import { activated, defineCard } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true, burySelf: true },
      {
        quick: true,
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        },
      },
    ),
  ],
});
