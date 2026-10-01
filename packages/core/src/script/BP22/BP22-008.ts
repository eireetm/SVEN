// BP22-008 ブラストフェアリー — Forestcraft follower, 1, 1/1. 妖精・キラー.
// ファンファーレ相手の場のフォロワー1体を選ぶ。それに「自分のEXエリアの妖精・カードの枚数」と同じダメージ。
// (Fanfare - Select an enemy follower on the field and deal it damage equal to the number of Pixie cards in your EX area.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { pixiesInEx } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, pixiesInEx(fx.game, fx.controller));
      },
    }),
  ],
});
