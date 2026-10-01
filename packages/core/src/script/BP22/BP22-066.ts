// BP22-066 シールドドラゴン — Dragoncraft follower, 3, 1/3. 竜族.
// 【守護】
// 自分のターンごとに1回、自分が手札を捨てたとき、相手の場のフォロワー1体を選ぶ。それに2ダメージ。
// ファンファーレ手札の元のコスト7以上のドラゴンカード1枚を捨てる：自分のPPを2回復する。
// (Ward. Once on each of your turns, when you discard (cards discarded together: once), select an enemy follower on the field and
// deal it 2 damage. Fanfare - Discard a Dragoncraft card that costs 7 or more (元のコスト): recover 2 play points.)
import { discardA } from "../costs";
import { defineCard, fanfare, whenYouDiscardAny } from "../helpers";
import { costAtLeast, enemyFollower, isClass } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    whenYouDiscardAny({
      oncePerTurn: true,
      triggerIf: (g, c) => g.activePlayer === c,
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
    fanfare({
      cost: discardA((g, id) => isClass("Dragoncraft")(g, id) && costAtLeast(7)(g, id)),
      *resolve(fx) {
        yield* fx.recoverPlayPoints(2);
      },
    }),
  ],
});
