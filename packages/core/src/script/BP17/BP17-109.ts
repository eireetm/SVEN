// BP17-109 Unicorn Altar — Havencraft amulet, 1. 信仰・偶像.
// {[fanfare]} Select an enemy follower on the field and deal it 2 damage. If you have at least 3 amulets on your field,
// deal 3 damage instead.
// {[act]} {[cost01]}, engage this, bury this: Give your leader {[defense]}+1. Activate only if you have at least 3 amulets
// on your field. (This amulet counts in both.)
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { amuletsOnField } from "./shared-haven";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, amuletsOnField(fx.game, fx.controller) >= 3 ? 3 : 2);
      },
    }),
    activated(
      { playPoints: 1, engageSelf: true, burySelf: true },
      {
        condition: (g, c) => amuletsOnField(g, c) >= 3,
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 1);
        },
      },
    ),
  ],
});
