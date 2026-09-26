// BP19-103 Sacrosanct Temple — Havencraft amulet, 1. 信仰.
// {[act]} {[cost01]}, engage this and bury an amulet: Select an enemy follower on the field and deal it 1 damage.
// (An amulet on your field, CR 10.4.3; this one too — ruling; the costs are paid in order, 10.4.2.1, and the ability
// resolves after this left, 10.6.2.8.2.1.)
import { buryFromYourField } from "../costs";
import { activated, defineCard } from "../helpers";
import { enemyFollower, isAmulet } from "../targets";

export default defineCard({
  abilities: [
    activated(
      { playPoints: 1, engageSelf: true, custom: buryFromYourField(isAmulet) },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 1);
        },
      },
    ),
  ],
});
