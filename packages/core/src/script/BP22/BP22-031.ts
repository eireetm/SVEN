// BP22-031 望遠の船長 — Swordcraft follower, 6, 4/4. 指揮官.
// 進化コスト1：これは進化する。
// 【守護】
// ファンファーレ自分のデッキの上4枚を見る。その中から、元のコスト3以下のフォロワーと元のコスト2以下のフォロワーそれぞれ1枚まで場に出してよい。
// 残りを好きな順にデッキの下に置く。
// (Evolve (1). Ward. Fanfare - Look at the top 4 cards of your deck; you may put up to one follower that costs 3 or less and up to
// one other follower that costs 2 or less among them onto your field (together); put the rest on the bottom in any order.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { isFollower } from "../targets";
import { costOf } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        const top = fx.topCards(4);
        const costing = (n: number) => (id: string) => isFollower(g, id) && (costOf(g, id) ?? Infinity) <= n;
        const first = yield* fx.selectCards(top.filter(costing(3)), 0, 1, fx.controller, top);
        const second = yield* fx.selectCards(top.filter((id) => !first.includes(id) && costing(2)(id)), 0, 1, fx.controller, top);
        const chosen = [...first, ...second];
        if (chosen.length > 0) yield* fx.putOntoField(chosen);
        yield* fx.bottomInAnyOrder(top.filter((id) => g.card(id)?.zone === "deck"));
      },
    }),
  ],
});
