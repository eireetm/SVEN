// BP01-065 Fate's Hand — Runecraft spell, 3. {[quick]}
// Draw 2 cards. Spellchain (10): Recover 1 play point.
// (Spellchain is fixed when the effect starts resolving, CR 13.3.1.4; not above the maximum.)
import { defineCard, spell } from "../helpers";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      *resolve(fx) {
        const sc10 = fx.game.spellchain(fx.controller, 10);
        yield* fx.draw(2);
        if (sc10) yield* fx.recoverPlayPoints(1);
      },
    }),
  ],
});
