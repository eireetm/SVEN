// BP22-023 アサルトナイト — Swordcraft follower, 1, 2/2. 兵士.
// 進化コスト2：これは進化する。
// ファンファーレ自分の場に『ビクトリーブレイダー』がいるなら、これは進化する。
// (Evolve (2). Fanfare - If there is a ビクトリーブレイダー (BP22-019) on your field, evolve this — an effect's evolution: no cost,
// and it doesn't use the evolve ability's once per turn (ruling, CR 8.3.2.1).)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { named } from "../targets";
import { onYourField, VICTORY_BLADER } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        if (onYourField(fx.game, fx.controller, named(VICTORY_BLADER)) && fx.game.card(fx.self)?.zone === "field") yield* fx.evolve(fx.self);
      },
    }),
  ],
});
