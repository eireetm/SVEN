// BP22-042 マジカルキャット — Runecraft follower, 2, 2/1. 魔法生物・獣.
// 進化コスト2：これは進化する。
// ファンファーレ墓場のウィッチカード2枚を消滅：これは進化する。
// (Evolve (2). Fanfare - Banish 2 Runecraft cards from your cemetery (CR 10.4.3): evolve this — an effect's evolution, no cost, not
// the evolve ability's once per turn (ruling).)
import { banishFromYour } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { isClass } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      cost: banishFromYour(["cemetery"], isClass("Runecraft"), 2),
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.evolve(fx.self);
      },
    }),
  ],
});
