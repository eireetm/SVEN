// BP22-040 巡りの大魔術師・レヴィ — Runecraft follower, 4, 4/4. 魔法使い.
// 進化コスト1：これは進化する。
// ファンファーレ【土の秘術】相手の場のフォロワー1体を選ぶ。それに5ダメージ。
// (Evolve (1). Fanfare - Earth Rite: select an enemy follower on the field and deal it 5 damage. CR 13.3.3: asked when it can be
// paid; nothing happens if not paid.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      earthRite: { mode: "required" },
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
      },
    }),
  ],
});
