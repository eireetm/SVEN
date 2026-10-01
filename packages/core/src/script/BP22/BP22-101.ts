// BP22-101 ミラクルラフター・カルミア (evolved) — Havencraft, 4/4. 光輝.
// 【進化時】2枚引く。自分の手札1枚を捨てる。
// (On Evolve - Draw 2 cards, then discard a card.)
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.draw(2);
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
  ],
});
