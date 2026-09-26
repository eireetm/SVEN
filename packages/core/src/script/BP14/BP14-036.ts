// BP14-036 Yukishima, Master Biographer — Runecraft follower, 4, 3/5. 宴楽・魔法使い・禁忌.
// {[fanfare]} The next Festive card that costs 3 or less or Mage card that costs 3 or less you play this turn
// costs 3 less.
// Whenever you play a Festive card that costs 3 or less or a Mage card that costs 3 or less, select an enemy
// follower on the field and deal it 2 damage. (元のコスト; once for a card that is both, and also during
// the opponent's turn — rulings.)
import { defineCard, fanfare, whenYouPlay } from "../helpers";
import { enemyFollower } from "../targets";
import { festiveOrMage3 } from "./shared";

export default defineCard({
  nextPlay: { festiveOrMage3: (g, card) => festiveOrMage3(g, card) },
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.nextPlayCostsLess("festiveOrMage3", 3);
      },
    }),
    whenYouPlay(
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        },
      },
      festiveOrMage3,
    ),
  ],
});
