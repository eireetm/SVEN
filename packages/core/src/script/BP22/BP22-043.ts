// BP22-043 マジカルキャット (evolved) — Runecraft, 3/2. 魔法生物・獣.
// 【指定攻撃】
// 【進化時】1枚引く。
// (Assail. On Evolve - Draw a card.)
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  keywords: ["assail"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
