// BP22-079 カースメーカー・スージー (evolved) — Abysscraft, 3/3. 魔界.
// 【進化時】相手の場のフォロワー1体を選ぶ。それに6ダメージ。自分のリーダーは体力+2する。
// (On Evolve - Select an enemy follower on the field, deal it 6 damage and give your leader +2 defense; nothing without a follower to
// select — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 6);
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
