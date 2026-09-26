// BP16-007 Lily, Crystallian Innocence — Forestcraft follower, 1, 1/1. クリスタリア.
// {[fanfare]} Select an enemy follower on the field and change its attack and defense to 1.
import { changeStatsTo, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* changeStatsTo(fx, fx.targets[0]![0]!, { attack: 1, defense: 1 });
      },
    }),
  ],
});
