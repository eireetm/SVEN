// BP22-115 ミニゴブリンメイジ — Neutral follower, 2, 2/3. ゴブリン.
// ファンファーレ自分のデッキの上2枚を見る。その中から、ゴブリン・カード1枚を公開して手札に加えてよい。残りを墓場に置く。
// (Fanfare - Look at the top 2 cards of your deck; you may reveal a Goblin card among them and add it to your hand; put the rest into
// your cemetery. The Chinese text says the rest go on the bottom of the deck; implemented from the Japanese text, which BP22 is
// built from — reported to the project owner.)
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
