// BP22-032 望遠の船長 (evolved) — Swordcraft, 5/5. 指揮官.
// 【守護】
// 【進化時】相手の場のフォロワー1体を選ぶ。それに5ダメージ。
// (Ward. On Evolve - Select an enemy follower on the field and deal it 5 damage.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
      },
    }),
  ],
});
