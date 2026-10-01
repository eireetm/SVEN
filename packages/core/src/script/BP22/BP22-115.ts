// BP22-115 ミニゴブリンメイジ — Neutral follower, 2, 2/3. ゴブリン.
// ファンファーレ自分のデッキの上2枚を見る。その中から、ゴブリン・カード1枚を公開して手札に加えてよい。残りを墓場に置く。
// (Fanfare - Look at the top 2 cards of your deck; you may reveal a Goblin card among them and add it to your hand; put the rest into
// your cemetery — as the printed card says (confirmed by the project owner); the pre-release Chinese text, which said the bottom
// of the deck, is corrected in data/fixes.ts.)
import { defineCard, fanfare, lookAtTopCards } from "../helpers";
import { goblin } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 2, { filter: goblin, to: "hand", rest: "cemetery" });
      },
    }),
  ],
});
