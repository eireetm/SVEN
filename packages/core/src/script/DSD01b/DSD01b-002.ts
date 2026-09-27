// DSD01b-002 気高き雷・ロマロニア (Evolved) — 2/4.
// Japanese-only data (no English text); implemented from the Japanese:
// 【指定攻撃】【必殺】 (Assail. Bane.)
// 【進化時】相手の場のフォロワー1体を選ぶ。自分の場にアミュレットがあるなら、それに3ダメージ。
// (On Evolve - Select an enemy follower on the field. If there is an amulet on your field, deal it 3 damage.)
// ラストワード (the same Last Words as DSD01b-001).
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower, isAmulet } from "../targets";
import { romaroniaLastWords } from "./shared";

export default defineCard({
  keywords: ["assail", "bane"],
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (fx.game.cards(fx.controller, "field").some((id) => isAmulet(fx.game, id))) yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
    romaroniaLastWords,
  ],
});
