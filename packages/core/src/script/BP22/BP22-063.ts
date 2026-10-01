// BP22-063 紅炎の竜爪・エチカ — Dragoncraft follower, 2, 2/2. ドラゴニュート.
// 【突進】
// 【攻撃時】相手の場のフォロワー1体を選ぶ。それに「自分のEXエリアのドラゴニュート・カードの枚数」と同じダメージ。
// ファンファーレ自分のデッキの上2枚を見る。その中から、ドラゴニュート・フォロワー1枚をEXエリアに置いてよい。残りを好きな順にデッキの下に置く。
// (Rush. Strike - Select an enemy follower on the field and deal it damage equal to the number of Dragonewt cards in your EX area.
// Fanfare - Look at the top 2 cards of your deck; you may put a Dragonewt follower among them into your EX area; put the rest on the
// bottom in any order.)
import { defineCard, fanfare, lookAtTopCards, strike } from "../helpers";
import { enemyFollower, isFollower } from "../targets";
import { dragonewt, dragonewtsInEx } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    strike({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, dragonewtsInEx(fx.game, fx.controller));
      },
    }),
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 2, { filter: (g, id) => isFollower(g, id) && dragonewt(g, id), to: "ex" });
      },
    }),
  ],
});
