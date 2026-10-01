// BP22-050 刃の魔術師 — Runecraft follower, 6, 2/2. 魔法使い.
// これをプレイする際、自分の墓場にあるカードの元のコストの種類数が6種類以上なら、コストを-6する。
// 進化コスト3：これは進化する。
// ファンファーレ相手の場のフォロワー1体を選ぶ。それに2ダメージ。
// (This costs 6 less to play if there are at least 6 different original costs among the cards in your cemetery. Evolve (3).
// Fanfare - Select an enemy follower on the field and deal it 2 damage.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { distinctCostsInCemetery } from "./shared";

export default defineCard({
  playCost: (g, _self, player) => (distinctCostsInCemetery(g, player) >= 6 ? -6 : 0),
  abilities: [
    evolveAbility(3),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
