// CP01-044 Champion's Passion — Dragoncraft amulet, 7. ウマ娘.
// {[fanfare]} If there is another Umamusume card on your field, select an enemy follower on the field and deal it 4 damage.
// At the start of your main phase, select an enemy leader or enemy follower on the field and deal it 4 damage.
import { atStartOfYourMainPhase, defineCard, fanfare } from "../helpers";
import { enemyFollower, enemyLeaderOrFollower } from "../targets";
import { umamusume } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      condition: (g, c, self) => g.cards(c, "field").some((id) => id !== self && umamusume(g, id)),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
    atStartOfYourMainPhase({
      targets: [enemyLeaderOrFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
  ],
});
