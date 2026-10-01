// BP22-014 冷徹のダークエルフ (evolved) — Forestcraft, 4/4. エルフ族・キラー.
// 【進化時】相手の場のフォロワー1体を選ぶ。それを破壊する。
// (On Evolve - Select an enemy follower on the field and destroy it.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy([fx.targets[0]![0]!]);
      },
    }),
  ],
});
