// BP22-048 アンブレラウィッチ — Runecraft follower, 4, 3/3. 魔法使い.
// ファンファーレ相手の場のフォロワー1体を選ぶ。自分の墓場にあるカードの元のコストの種類数が6種類以上なら、それに3ダメージ。自分のリーダーは体力
// +3する。自分のPPを3回復する。
// (Fanfare - Select an enemy follower on the field. If there are at least 6 different original costs among the cards in your
// cemetery, deal it 3 damage, give your leader +3 defense and recover 3 play points — all three under the condition (Q10); without a
// follower to select, the Fanfare can't be played (ruling).)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { distinctCostsInCemetery } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (distinctCostsInCemetery(fx.game, fx.controller) < 6) return;
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        yield* fx.giveLeaderDefense(fx.controller, 3);
        yield* fx.recoverPlayPoints(3);
      },
    }),
  ],
});
