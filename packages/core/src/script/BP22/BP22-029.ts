// BP22-029 アームドバトラー — Swordcraft follower, 2, 1/3. 兵士.
// ファンファーレ自分のデッキの上3枚を見る。その中から、指揮官・カード1枚を公開して手札に加えてよい。残りを好きな順にデッキの下に置く。
// 起動これをアクト：相手の場のフォロワー1体を選ぶ。それに1ダメージ。この能力は自分の場に指揮官・カードがあるなら使える。
// (Fanfare - Look at the top 3 cards of your deck; you may reveal a Commander card among them and add it to your hand; put the rest
// on the bottom in any order. Activate, engage this: select an enemy follower on the field and deal it 1 damage; only if there is
// a Commander card on your field.)
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { enemyFollower } from "../targets";
import { commander, onYourField } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 3, { filter: commander, to: "hand" });
      },
    }),
    activated(
      { engageSelf: true },
      {
        condition: (g, c) => onYourField(g, c, commander),
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 1);
        },
      },
    ),
  ],
});
