// BP22-103 希望の守護者・ソニア — Havencraft follower, 2, 2/3. 信仰.
// 【守護】
// ファンファーレ自分のデッキの上3枚を見る。その中から、【守護】を持つフォロワー1枚を公開して手札に加えてよい。残りを好きな順にデッキの下に置く。
// (Ward. Fanfare - Look at the top 3 cards of your deck; you may reveal a follower with Ward among them and add it to your hand; put
// the rest on the bottom in any order.)
import { defineCard, fanfare, lookAtTopCards } from "../helpers";
import { isFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 3, { filter: (g, id) => isFollower(g, id) && g.info(id).keywords.includes("ward"), to: "hand" });
      },
    }),
  ],
});
