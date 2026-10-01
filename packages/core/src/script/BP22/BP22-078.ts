// BP22-078 カースメーカー・スージー — Abysscraft follower, 2, 2/2. 魔界.
// 進化コスト1：これは進化する。この能力は自分の墓場の元のコスト2のカードが10枚以上なら使える。
// ファンファーレ自分のデッキの上2枚を墓場に置く。
// (Evolve (1), only with at least 10 cards that cost 2 in your cemetery. Fanfare - Put the top 2 cards of your deck into your
// cemetery.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { cost2InCemetery } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1, { condition: (g, c) => cost2InCemetery(g, c) >= 10 }),
    fanfare({
      *resolve(fx) {
        yield* fx.mill(2);
      },
    }),
  ],
});
