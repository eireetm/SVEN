// BP13-039 Rending Blast — Runecraft advanced spell, 3. 魔法使い・学院・プリンセス・キラー.
// Deal 8 damage to each enemy leader. (Played from the evolve deck by BP13-036; afterwards it goes back
// there faceup, CR 9.2.2.)
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 8);
      },
    }),
  ],
});
