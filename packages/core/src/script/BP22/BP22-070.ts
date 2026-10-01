// BP22-070 堅殻のドラゴスネーク — Dragoncraft follower, 2, 3/2. 竜族.
// 【突進】
// ラストワードコスト2：自分のデッキから『堅殻のドラゴスネーク』1枚を探し、場に出す。
// (Rush. Last Words - {[cost02]}: search your deck for a 堅殻のドラゴスネーク and summon it (an optional cost, CR 10.4.7.4).)
import { playPointsCost } from "../costs";
import { defineCard, lastWords } from "../helpers";
import { named } from "../targets";
import { DRAGOSNAKE } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    lastWords({
      cost: playPointsCost(2),
      *resolve(fx) {
        yield* fx.search((id) => named(DRAGOSNAKE)(fx.game, id), { to: "field" });
      },
    }),
  ],
});
