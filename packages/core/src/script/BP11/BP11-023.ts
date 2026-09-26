// BP11-023 Radical Gunslinger — Swordcraft follower, 1, 0/1. 荒野・兵士.
// {[fanfare]} Summon a Dutiful Steed token.
// Activate {[engage]} and 2 Mount cards on your field: Select an enemy leader or enemy follower on the
// field and deal it 2 damage.
import { engageYourCards } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { enemyLeaderOrFollower } from "../targets";
import { mount, STEED } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon([STEED]);
      },
    }),
    activated(
      { engageSelf: true, custom: engageYourCards(mount, 2) },
      {
        targets: [enemyLeaderOrFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        },
      },
    ),
  ],
});
