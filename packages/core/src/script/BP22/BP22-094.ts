// BP22-094 ホーリーセイバー (evolved) — Havencraft, 3/3. 先導.
// 【守護】
// 【進化時】相手の場のフォロワー1体を選ぶ。それに2ダメージ。
// 【超進化時】『聖女の号令』1枚をEXエリアに置く。
// (Ward. On Evolve - Select an enemy follower on the field and deal it 2 damage. On Super-Evolve - Put a 聖女の号令 (BP22-T01) token
// into your EX area. Super-evolving triggers both, in either order (rulings).)
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { SAINTS_COMMAND } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
    onSuperEvolve({
      *resolve(fx) {
        yield* fx.tokensToEx([SAINTS_COMMAND]);
      },
    }),
  ],
});
