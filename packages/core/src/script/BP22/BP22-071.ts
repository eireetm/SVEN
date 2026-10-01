// BP22-071 雷龍 — Dragoncraft follower, 7, 5/7. 竜族.
// 【疾走】
// ファンファーレ相手の場のフォロワー1体を選ぶ。それに5ダメージ。1枚引く。
// (Storm. Fanfare - Select an enemy follower on the field, deal it 5 damage and draw a card; nothing without a follower to select —
// ruling.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
        yield* fx.draw(1);
      },
    }),
  ],
});
