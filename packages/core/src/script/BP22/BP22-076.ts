// BP22-076 ダークエンペラー (evolved) — Abysscraft, 5/7. 魔界.
// 【オーラ】
// 【進化時】相手の場のフォロワー2体まで選ぶ。それを破壊する。自分のリーダーは体力+5する。
// ラストワード相手のリーダーすべてに5ダメージ。
// (Aura. On Evolve - Select up to 2 enemy followers on the field and destroy them; give your leader +5 defense — also with none
// selected (ruling). Last Words - Deal 5 damage to each enemy leader.)
import { defineCard, lastWords, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["aura"],
  abilities: [
    onEvolve({
      targets: [enemyFollower({ count: 2, upTo: true })],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0] ?? []);
        yield* fx.giveLeaderDefense(fx.controller, 5);
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 5);
      },
    }),
  ],
});
