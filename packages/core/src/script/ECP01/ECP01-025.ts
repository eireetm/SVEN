// ECP01-025 Daitaku Helios — Runecraft follower, 2, 2/2. ウマ娘.
// {[feed]} {[cost01]}: Race this follower.
// {[fanfare]} Select an enemy follower on the field and deal it 1 damage. If there's an Umamusume card that costs 4 or more on
// your field, deal 3 damage instead. (元のコスト; an evolved follower keeps its base card's, CR 5.16.1.2.)
import { defineCard, fanfare, serveAbility } from "../helpers";
import { costAtLeast, enemyFollower } from "../targets";
import { umamusume } from "./shared";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        const g = fx.game;
        const big = g.cards(fx.controller, "field").some((id) => umamusume(g, id) && costAtLeast(4)(g, id));
        yield* fx.dealDamage(fx.targets[0]![0]!, big ? 3 : 1);
      },
    }),
  ],
});
