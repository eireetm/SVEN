// CP03-048 Mistress Hurricane — Runecraft follower, 2, 3/2. ヴァンガード・ペイルムーン.
// {[fanfare]} If there are at least 5 cards in your banished zone, give this follower Storm. (Checked when it resolves: a
// Fanfare resolved before it may banish more — ruling.)
// Activate {[engage]}, banish this card: Select an enemy follower on the field and deal it 3 damage.
import { banishThis } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { countIn } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      condition: (g, c) => countIn(g, c, "banished") >= 5,
      *resolve(fx) {
        yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
    activated(
      { engageSelf: true, custom: banishThis },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        },
      },
    ),
  ],
});
