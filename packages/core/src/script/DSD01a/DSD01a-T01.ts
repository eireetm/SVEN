// DSD01a-T01 マナリアの魔弾 (Mysterian bullet) — Runecraft token spell, 2. 魔法使い・学院.
// Japanese-only data (no English text); implemented from the Japanese:
// 相手の場のフォロワー1体を選ぶ。それに3ダメージ。自分の墓場の学院・カードが10枚以上なら、それのリーダーに2ダメージ。
// (Select an enemy follower on the field. Deal it 3 damage. If there are at least 10 Academic cards in your cemetery, deal 2 damage to
// its leader. This spell doesn't count itself — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { academicsInCemetery, leaderOf } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = leaderOf(fx, target);
        yield* fx.dealDamage(target, 3);
        if (academicsInCemetery(fx.game, fx.controller) >= 10) yield* fx.dealDamage(leader, 2);
      },
    }),
  ],
});
