// BP22-020 ゴールデンウォーリアー — Swordcraft follower, 4, 3/4. 兵士・貴族.
// 自分のEXエリアに『輝く金貨』が置かれたとき、相手の場のフォロワー1体を選ぶ。それに1ダメージ。
// ファンファーレ『輝く金貨』1枚をEXエリアに置く。自分のEXエリアの『輝く金貨』が4枚以上なら、自分のPPを3回復する。
// (Whenever a Glittering Gold is put into your EX area — two at once trigger twice (ruling) — select an enemy follower on the
// field and deal it 1 damage. Fanfare - Put a Glittering Gold token into your EX area; if there are at least 4 in your EX area
// (the new one counts — ruling), recover 3 play points.)
import { defineCard, fanfare, whenCardPutIntoYourEx } from "../helpers";
import { enemyFollower, named } from "../targets";
import { GLITTERING_GOLD } from "./shared";

export default defineCard({
  abilities: [
    whenCardPutIntoYourEx(
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 1);
        },
      },
      named(GLITTERING_GOLD),
    ),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([GLITTERING_GOLD]);
        if (fx.game.cards(fx.controller, "ex").filter((id) => named(GLITTERING_GOLD)(fx.game, id)).length >= 4) yield* fx.recoverPlayPoints(3);
      },
    }),
  ],
});
