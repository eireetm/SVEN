// BP22-017 ダンジョンフェアリー — Forestcraft follower, 1, 2/2. 妖精.
// 自分のターンごとに1回、自分のカード1枚以上がEXエリアを離れたとき、『フェアリー』X枚をEXエリアに置く。Xは「EXエリアを離れた自分のカードの枚数」
// である。
// (Once on each of your turns, when 1 or more of your cards leave the EX area, put X Fairy tokens into your EX area, X = the number
// of your cards that left it. Playing a card from the EX area and transforming cards there count — rulings.)
import { defineCard, whenYourCardsLeaveEx } from "../helpers";
import { FAIRY } from "./shared";

export default defineCard({
  abilities: [
    whenYourCardsLeaveEx({
      oncePerTurn: true,
      triggerIf: (g, c) => g.activePlayer === c,
      *resolve(fx) {
        yield* fx.tokensToEx(Array<string>(fx.data?.count ?? 0).fill(FAIRY));
      },
    }),
  ],
});
