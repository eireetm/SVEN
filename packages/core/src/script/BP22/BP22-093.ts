// BP22-093 ホーリーセイバー — Havencraft follower, 2, 2/2. 先導.
// 進化コスト1：これは進化する。
// 【守護】
// ファンファーレ相手の場のフォロワー1体を選ぶ。自分の場の【守護】を持つフォロワーが3体以上なら、それに2ダメージ。
// (Evolve (1). Ward. Fanfare - Select an enemy follower on the field; if there are at least 3 followers with Ward on your field
// (this one too), deal it 2 damage.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        const wards = fx.game.followers(fx.controller).filter((id) => fx.game.info(id).keywords.includes("ward")).length;
        if (wards >= 3) yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
