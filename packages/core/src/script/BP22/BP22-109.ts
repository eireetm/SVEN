// BP22-109 禁じられた儀式 — Havencraft amulet, 2. 狂信.
// 自分のエンドフェイズが来たとき、自分のリーダーに2ダメージ。
// ファンファーレ相手の場のフォロワー1体を選ぶ。それを破壊する。
// (At the start of your end phase, deal 2 damage to your leader. Fanfare - Select an enemy follower on the field and destroy it.)
import { atStartOfYourEndPhase, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.controller), 2);
      },
    }),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy([fx.targets[0]![0]!]);
      },
    }),
  ],
});
