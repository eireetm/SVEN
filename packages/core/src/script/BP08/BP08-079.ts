// BP08-079 Kiss of Lust — Abysscraft spell, 2. 絶傑・魔界.
// Give your leader +2 defense. Draw 1 card, or 2 instead if Sanguine is active (CR 5.10, 5.27,
// 13.5.2).
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const draw = fx.game.sanguine(fx.controller) ? 2 : 1;
        yield* fx.giveLeaderDefense(fx.controller, 2);
        yield* fx.draw(draw);
      },
    }),
  ],
});
