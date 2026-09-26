// BP14-T03 Flame General's Regalia — Swordcraft amulet token, 3. 指揮官・星神.
// Whenever a follower on your field evolves, select an enemy follower on the field and deal it 2 damage.
// {[act]} {[cost01]}, engage this, bury this: Select a Commander follower on your field and give it "Strike -
// Deal 2 damage to each enemy leader."
import { activated, defineCard, whenYourFollowerEvolves } from "../helpers";
import { enemyFollower, yourFollower } from "../targets";
import { commander } from "./shared";

export default defineCard({
  abilities: [
    whenYourFollowerEvolves({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
    activated(
      { playPoints: 1, engageSelf: true, burySelf: true },
      {
        targets: [yourFollower({ filter: commander })],
        *resolve(fx) {
          yield* fx.grant(fx.targets[0]![0]!, "strikeDamageLeaders2");
        },
      },
    ),
  ],
});
