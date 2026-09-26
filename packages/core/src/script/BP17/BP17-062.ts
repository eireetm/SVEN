// BP17-062 Dragonslayer Spear — Dragoncraft amulet, 1. 竜族・武闘竜人・キラー.
// {[fanfare]} Select an enemy follower on the field and deal it 2 damage.
// Activate {[engage]} this, bury this: Select a Rowen, Dragon Lance on your field. The next time it would take damage this
// turn, it doesn't. ("-2/-2" isn't damage; an attack with 0 attack deals no damage and doesn't use it up — rulings.)
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower, named, yourFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
    activated(
      { engageSelf: true, burySelf: true },
      {
        targets: [yourFollower({ filter: named("Rowen, Dragon Lance") })],
        *resolve(fx) {
          yield* fx.preventNextDamage(fx.targets[0]![0]!, "endOfTurn");
        },
      },
    ),
  ],
});
