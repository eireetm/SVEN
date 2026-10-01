// BP22-009 清き泉のエルフプリンセスメイジ — Forestcraft follower, 2, 2/2. エルフ族・プリンセス.
// 進化コスト1：これは進化する。
// ファンファーレ『フェアリー』2枚をEXエリアに置く。
// (Evolve (1). Fanfare - Put 2 Fairy tokens into your EX area.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { FAIRY } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([FAIRY, FAIRY]);
      },
    }),
  ],
});
