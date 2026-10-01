// BP22-024 アサルトナイト (evolved) — Swordcraft, 3/3. 兵士.
// 【指定攻撃】
// 【進化時】自分の場のフォロワー1体を選ぶ。それはこのターン、「これは交戦ダメージを受けない」を持つ。
// (Assail. On Evolve - Select a follower on your field; for the rest of this turn it doesn't take combat damage, CR 5.14.3.2.)
import { defineCard, onEvolve } from "../helpers";
import { yourFollower } from "../targets";

export default defineCard({
  keywords: ["assail"],
  abilities: [
    onEvolve({
      targets: [yourFollower()],
      *resolve(fx) {
        yield* fx.preventDamage(fx.targets[0]![0]!, "combat", "endOfTurn");
      },
    }),
  ],
});
