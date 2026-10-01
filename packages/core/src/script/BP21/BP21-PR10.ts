// BP21-PR10 グレアの炎熱 — Runecraft spell, 1. 魔法使い・学院・プリンセス. (A reprint of DSD01a-009; the data has only the
// Japanese name and text, so it is implemented from the Japanese text.)
// クイック
// 相手の場のフォロワー1体を選ぶ。それに2ダメージ。自分の墓場の学院・カードが5枚以上なら、代わりに3ダメージ。
// (Quick. Select an enemy follower on the field and deal it 2 damage. If there are at least 5 Academic cards in your
// cemetery, 3 instead. This card is still in the resolution zone and doesn't count — ruling, CR 10.6.2.8.2.3.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { academicsInCemetery } from "./shared";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, academicsInCemetery(fx.game, fx.controller) >= 5 ? 3 : 2);
      },
    }),
  ],
});
