// BP16-064 Fan of Otohime — Dragoncraft amulet, 1. 海洋.
// Activate {[engage]} this, bury this: Summon a Megalorca token.
// {[act]} {[cost01]}, engage this, bury this: Select an enemy follower on the field and deal it 4 damage. Activate
// only if there's a Marine follower on your field.
import { activated, defineCard } from "../helpers";
import { enemyFollower, isFollower } from "../targets";
import { countIn, marine } from "./shared";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true, burySelf: true },
      {
        *resolve(fx) {
          yield* fx.summon(["Megalorca"]);
        },
      },
    ),
    activated(
      { playPoints: 1, engageSelf: true, burySelf: true },
      {
        condition: (g, p) => countIn(g, p, "field", (gr, id) => isFollower(gr, id) && marine(gr, id)) > 0,
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        },
      },
    ),
  ],
});
