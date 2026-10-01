// BP22-021 千金武装の大参謀・アルメリゼ — Swordcraft follower, 2, 2/2. 指揮官・貴族.
// 進化コスト1：これは進化する。
// ファンファーレ『輝く金貨』1枚をEXエリアに置く。自分のリーダーは体力+2する。
// (Evolve (1). Fanfare - Put a Glittering Gold token into your EX area and give your leader +2 defense.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { GLITTERING_GOLD } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([GLITTERING_GOLD]);
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
