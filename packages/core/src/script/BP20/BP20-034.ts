// BP20-034 Mercurial Mercenary — Swordcraft follower, 2, 2/3. 兵士.
// {[fanfare]} {[cost02]} Search your deck for a Mercurial Mercenary, summon it, then shuffle. Give each Mercurial Mercenary
// on your field {[attack]}+1/{[defense]}+1. (Both after the cost, CR 10.4.7.4.)
// Activate {[engage]} this: Select an enemy follower on the field and deal damage to it equal to the number of cards named
// Mercurial Mercenary on your field.
import { playPointsCost } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower, named } from "../targets";

const mercenary = named("Mercurial Mercenary");

export default defineCard({
  abilities: [
    fanfare({
      cost: playPointsCost(2),
      *resolve(fx) {
        yield* fx.search((id) => mercenary(fx.game, id), { to: "field" });
        for (const id of fx.game.cards(fx.controller, "field").filter((c) => mercenary(fx.game, c))) yield* fx.giveStats(id, 1, 1);
      },
    }),
    activated(
      { engageSelf: true },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          const n = fx.game.cards(fx.controller, "field").filter((c) => mercenary(fx.game, c)).length;
          if (n > 0) yield* fx.dealDamage(fx.targets[0]![0]!, n);
        },
      },
    ),
  ],
});
