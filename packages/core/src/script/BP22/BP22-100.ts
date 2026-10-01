// BP22-100 ミラクルラフター・カルミア — Havencraft follower, 2, 2/2. 光輝.
// 進化コスト4：これは進化する。
// ファンファーレ自分の場のカードが5枚なら、これは進化する。
// (Evolve (4). Fanfare - If there are 5 cards on your field (this one too; 「5枚なら」, exactly 5), evolve this — an effect's
// evolution (ruling).)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(4),
    fanfare({
      *resolve(fx) {
        if (fx.game.cards(fx.controller, "field").length === 5 && fx.game.card(fx.self)?.zone === "field") yield* fx.evolve(fx.self);
      },
    }),
  ],
});
