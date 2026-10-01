// BP22-034 ブレードバンデッド — Swordcraft follower, 3, 3/3. 盗賊.
// 【疾走】
// ファンファーレ『輝く金貨』1枚をEXエリアに置く。
// (Storm. Fanfare - Put a Glittering Gold token into your EX area.)
import { defineCard, fanfare } from "../helpers";
import { GLITTERING_GOLD } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([GLITTERING_GOLD]);
      },
    }),
  ],
});
