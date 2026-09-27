// DSD01a-006 マナリアナイト・オーウェン (Mysterian knight Owen) — Runecraft follower, 2, 3/2. 魔法使い・学院.
// Japanese-only data (no English text); implemented from the Japanese:
// 【突進】 (Rush.)
// 【攻撃時】『マナリアの魔弾』1枚をEXエリアに置く。 (Strike: Put a マナリアの魔弾 token into your EX area.)
// ファンファーレ自分の墓場の学院・カードが5枚以上なら、これは攻撃力+1/体力+1して、【指定攻撃】を持つ。
//   ({[fanfare]} If there are at least 5 Academic cards in your cemetery, give this follower +1/+1 and Assail.)
import { defineCard, fanfare, strike } from "../helpers";
import { MAGIC_BULLET, academicsInCemetery } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    strike({
      *resolve(fx) {
        yield* fx.tokensToEx([MAGIC_BULLET]);
      },
    }),
    fanfare({
      *resolve(fx) {
        if (academicsInCemetery(fx.game, fx.controller) < 5) return;
        yield* fx.giveStats(fx.self, 1, 1);
        yield* fx.giveKeyword(fx.self, "assail");
      },
    }),
  ],
});
