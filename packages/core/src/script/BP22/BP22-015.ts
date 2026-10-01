// BP22-015 フェアリーブリンガー — Forestcraft follower, 2, 1/3. エルフ族.
// 【守護】
// ファンファーレ『フェアリー』2枚をEXエリアに置く。1枚引く。自分の手札1枚を捨てる。
// (Ward. Fanfare - Put 2 Fairy tokens into your EX area. Draw a card, then discard a card.)
import { defineCard, fanfare } from "../helpers";
import { FAIRY } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([FAIRY, FAIRY]);
        yield* fx.draw(1);
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
  ],
});
