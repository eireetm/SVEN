// BP22-003 永久なる輝き・エリン — Forestcraft follower, 4, 2/4. クリスタリア.
// 進化コスト1：これは進化する。
// 自分の場に「これと同名を除くクリスタリア・フォロワー」が出たとき、それは進化する。
// ファンファーレ自分のデッキの上4枚を見る。その中から、クリスタリア・カード1枚を公開して手札に加えてよい。残りを好きな順にデッキの下に置く。
// (Evolve (1). Whenever a Crystalia follower not named Erin is put onto your field, evolve it — without paying its evolve
// cost, and its player may decline (rulings). Fanfare - Look at the top 4 cards of your deck; you may reveal a Crystalia card
// among them and add it to your hand; put the rest on the bottom in any order.)
import { defineCard, evolveAbility, fanfare, lookAtTopCards } from "../helpers";
import { crystalia } from "./shared";
import { erinEvolvesCrystalia } from "./shared-forest";

export default defineCard({
  abilities: [
    evolveAbility(1),
    erinEvolvesCrystalia,
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: crystalia, to: "hand" });
      },
    }),
  ],
});
