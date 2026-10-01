// BP22-046 フェイクウィング・エリーナ — Runecraft follower, 2, 2/2. 超克.
// 進化コスト1：これは進化する。
// ファンファーレ自分のデッキの上1枚を消滅させる。
// (Evolve (1). Fanfare - Banish the top card of your deck.)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.banish(fx.topCards(1));
      },
    }),
  ],
});
