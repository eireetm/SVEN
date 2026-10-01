// BP22-110 ゴブリンエンペラー — Neutral follower, 5, 3/3. ゴブリン.
// 自分の場に他のゴブリン・フォロワーが出たとき、相手の場のフォロワー1体を選ぶ。それに2ダメージ。
// ファンファーレ自分のデッキの上5枚を見る。その中から、ゴブリン・カードを元のコストの合計が4以下になるように2枚までEXエリアに置いてよい。残りを好きな
// 順にデッキの下に置く。このターン、それをプレイする際、コストを0にする。
// (Whenever another Goblin follower is put onto your field — during the opponent's turn too (ruling) — select an enemy follower on
// the field and deal it 2 damage. Fanfare - Look at the top 5 cards of your deck; you may put up to 2 Goblin cards that cost a total
// of 4 or less (元のコスト) among them into your EX area; put the rest on the bottom in any order; those cost 0 to play this turn.)
import { defineCard, fanfare, selectWithinTotalCost, whenFollowerEntersYourField } from "../helpers";
import { enemyFollower } from "../targets";
import { goblin } from "./shared";

export default defineCard({
  abilities: [
    whenFollowerEntersYourField(
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        },
      },
      { another: true, filter: goblin },
    ),
    fanfare({
      *resolve(fx) {
        const top = fx.topCards(5);
        const chosen = yield* selectWithinTotalCost(fx, top.filter((id) => goblin(fx.game, id)), 4, 2, top);
        const moved = yield* fx.putIntoEx(chosen);
        yield* fx.bottomInAnyOrder(top.filter((id) => fx.game.card(id)?.zone === "deck"));
        for (const card of moved) yield* fx.setPlayCost(card, 0, "endOfTurn");
      },
    }),
  ],
});
