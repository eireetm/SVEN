// BP22-112 メチャカワ傭兵・フィーナ — Neutral follower, 3, 2/2. 傭兵.
// ファンファーレ自分のデッキの上4枚を見る。その中から、ゴブリン・カード1枚を公開して手札に加えてよい。残りを好きな順にデッキの下に置く。自分の手札の
// 元のコスト2以下のゴブリン・フォロワー1枚を場に出してよい。
// (Fanfare - Look at the top 4 cards of your deck; you may reveal a Goblin card among them and add it to your hand; put the rest on
// the bottom in any order. Then you may put a Goblin follower that costs 2 or less (元のコスト) from your hand onto your field.)
import { defineCard, fanfare, lookAtTopCards } from "../helpers";
import { isFollower } from "../targets";
import { costOf, goblin } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: goblin, to: "hand" });
        const g = fx.game;
        const small = g.cards(fx.controller, "hand").filter((id) => isFollower(g, id) && goblin(g, id) && (costOf(g, id) ?? Infinity) <= 2);
        const chosen = yield* fx.chooseCards(small, 0, 1);
        if (chosen.length > 0) yield* fx.putOntoField(chosen);
      },
    }),
  ],
});
