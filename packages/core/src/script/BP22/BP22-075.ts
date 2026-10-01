// BP22-075 ダークエンペラー — Abysscraft follower, 7, 4/6. 魔界.
// 進化コスト1：これは進化する。
// 【オーラ】
// ファンファーレ自分のリーダーの体力が10以下なら、これは進化する。
// (Evolve (1). Aura. Fanfare - If your leader has 10 or less defense, evolve this — an effect's evolution (ruling).)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  keywords: ["aura"],
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        const defense = fx.game.state.players[fx.controller].leaderDefense;
        if (defense <= 10 && fx.game.card(fx.self)?.zone === "field") yield* fx.evolve(fx.self);
      },
    }),
  ],
});
