// BP22-065 珊瑚礁の精霊 (evolved) — Dragoncraft, 4/4. 海洋.
// 【進化時】手札の海洋・カード1枚をEXエリアに置く：相手の場のフォロワー1体を選ぶ。それに4ダメージ。自分のリーダーは体力+1する。
// (On Evolve - Put a Marine card from your hand into your EX area: select an enemy follower on the field, deal it 4 damage and give
// your leader +1 defense. Without a follower to select it can't be played, and nothing happens — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import type { CustomCost } from "../types";
import { marine } from "./shared";

const marineFromHandToEx: CustomCost = {
  canPay: (g, c) => g.cards(c, "ex").length < g.exAreaLimit(c) && g.cards(c, "hand").some((id) => marine(g, id)),
  *pay(fx) {
    const [card] = yield* fx.chooseCards(fx.game.cards(fx.controller, "hand").filter((id) => marine(fx.game, id)), 1, 1);
    if (card !== undefined) yield* fx.putIntoEx([card]);
  },
};

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      cost: marineFromHandToEx,
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
