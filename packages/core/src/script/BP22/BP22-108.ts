// BP22-108 コンス — Havencraft follower, 3, 3/3. 先導.
// ファンファーレコスト2場のアミュレット1つを墓場に置く：相手の場のフォロワー1体を選ぶ。それを破壊する。これは攻撃力+2/体力+2する。
// (Fanfare - {[cost02]}, bury an amulet on your field (CR 10.4.3): select an enemy follower on the field and destroy it; give this
// +2/+2. Nothing without a follower to select — ruling.)
import { allCosts, buryFromYourField, playPointsCost } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { enemyFollower, isAmulet } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      cost: allCosts(playPointsCost(2), buryFromYourField(isAmulet, 1)),
      *resolve(fx) {
        yield* fx.destroy([fx.targets[0]![0]!]);
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 2, 2);
      },
    }),
  ],
});
