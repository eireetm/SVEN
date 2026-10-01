// BP22-095 白翼の慈愛・アイテール — Havencraft follower, 4, 2/3. 信仰・先導・光輝.
// 【守護】
// ファンファーレ手札の【守護】を持つフォロワー1枚を捨てる：自分のデッキから元のコスト2の【守護】を持つフォロワー1枚と元のコスト1の【守護】を持つフォ
// ロワー1枚を探し、場に出す。
// (Ward. Fanfare - Discard a follower with Ward: search your deck for a 2-cost follower with Ward and a 1-cost follower with Ward
// (元のコスト) and summon them — either may be left unfound (ruling, CR 5.8).)
import { discardA } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { isFollower } from "../targets";
import { costOf } from "./shared";

const ward = (g: import("../../engine/query").GameReader, id: string) => isFollower(g, id) && g.info(id).keywords.includes("ward");

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      cost: discardA(ward),
      *resolve(fx) {
        const g = fx.game;
        yield* fx.searchEach([(id) => ward(g, id) && costOf(g, id) === 2, (id) => ward(g, id) && costOf(g, id) === 1], { to: "field" });
      },
    }),
  ],
});
