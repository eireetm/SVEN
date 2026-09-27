// CP02-085 Last Daylight — Abysscraft spell, 2. デレマス・クール.
// Select an enemy follower on the field. Deal it 3 damage and give {[attack]}+1 to each follower that costs 1 or less on your
// field. (元のコスト; without an enemy follower it can't be played — ruling, CR 10.6.2.3.3.)
import { defineCard, spell } from "../helpers";
import { costAtMost, enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        for (const id of fx.game.followers(fx.controller)) if (costAtMost(1)(fx.game, id)) yield* fx.giveStats(id, 1, 0);
      },
    }),
  ],
});
