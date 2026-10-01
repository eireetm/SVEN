// BP22-114 ゴブリンリーダー (evolved) — Neutral, 2/2. ゴブリン.
// 自分の場に他のゴブリン・フォロワーが出たとき、それは攻撃力+1する。
// 【進化時】自分のデッキの上4枚を見る。その中から、元のコスト2以下のゴブリン・カード1枚をEXエリアに置いてよい。残りを好きな順にデッキの下に置く。こ
// のターン、それをプレイする際、コストを-2する。
// (Whenever another Goblin follower is put onto your field, give it +1/+0. On Evolve - Look at the top 4 cards of your deck; you may
// put a Goblin card that costs 2 or less (元のコスト) among them into your EX area; put the rest on the bottom in any order; it costs
// 2 less to play this turn.)
import { defineCard, lookAtTopCards, onEvolve, whenFollowerEntersYourField } from "../helpers";
import { costOf, goblin } from "./shared";

export default defineCard({
  abilities: [
    whenFollowerEntersYourField(
      {
        *resolve(fx) {
          const card = fx.data?.card;
          if (card !== undefined && fx.game.card(card)?.zone === "field") yield* fx.giveStats(card, 1, 0);
        },
      },
      { another: true, filter: goblin },
    ),
    onEvolve({
      *resolve(fx) {
        const moved = yield* lookAtTopCards(fx, 4, { filter: (g, id) => goblin(g, id) && (costOf(g, id) ?? Infinity) <= 2, to: "ex" });
        for (const card of moved) yield* fx.changePlayCost(card, -2, "endOfTurn");
      },
    }),
  ],
});
