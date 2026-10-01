// BP22-069 ヘイルドラゴン (evolved) — Dragoncraft, 5/7. 竜族.
// 【進化時】相手の場のフォロワー1体を選ぶ。それに5ダメージ。
// (On Evolve - Select an enemy follower on the field and deal it 5 damage.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
      },
    }),
  ],
});
