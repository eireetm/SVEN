// BP22-033 エレガントバンデッド — Swordcraft follower, 1, 2/2. 盗賊.
// ファンファーレ/ラストワード『輝く金貨』1枚をEXエリアに置く。
// (Fanfare and Last Words - Put a Glittering Gold token into your EX area: two abilities, CR 12.4, 12.5.)
import { defineCard, fanfare, lastWords } from "../helpers";
import { GLITTERING_GOLD } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([GLITTERING_GOLD]);
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.tokensToEx([GLITTERING_GOLD]);
      },
    }),
  ],
});
