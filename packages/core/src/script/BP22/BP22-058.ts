// BP22-058 ブルータルドラゴニュート — Dragoncraft follower, 4, 4/3. ドラゴニュート.
// 【疾走】
// ファンファーレ自分のEXエリアのドラゴニュート・カードが2枚以上なら、自分のPPを2回復する。
// (Storm. Fanfare - If there are at least 2 Dragonewt cards in your EX area, recover 2 play points.)
import { defineCard, fanfare } from "../helpers";
import { dragonewtsInEx } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    fanfare({
      *resolve(fx) {
        if (dragonewtsInEx(fx.game, fx.controller) >= 2) yield* fx.recoverPlayPoints(2);
      },
    }),
  ],
});
