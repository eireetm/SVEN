// CP04-015 Aoi — Forestcraft follower, 1, 2/1. プリコネ・フォレスティエ.
// {[ub]} Activate {[engage]} this: Select an enemy follower on the field and give it {[attack]}-1/{[defense]}-1.
import { activated, defineCard, ub } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    ub(
      activated(
        { engageSelf: true },
        {
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.giveStats(fx.targets[0]![0]!, -1, -1);
          },
        },
      ),
    ),
  ],
});
