// BP22-104 ホーリーキャット — Havencraft follower, 2, 2/3. 光輝・獣.
// 進化コスト1：これは進化する。
// ファンファーレ自分の場にアミュレットがあるなら、これは進化する。
// (Evolve (1). Fanfare - If there is an amulet on your field, evolve this — an effect's evolution (ruling). The evolved card,
// BP22-105, has no text.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { isAmulet } from "../targets";
import { onYourField } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        if (onYourField(fx.game, fx.controller, isAmulet) && fx.game.card(fx.self)?.zone === "field") yield* fx.evolve(fx.self);
      },
    }),
  ],
});
