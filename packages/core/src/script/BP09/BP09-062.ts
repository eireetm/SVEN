// BP09-062 Waters of the Megalorca — Dragoncraft spell, 1. 海洋.
// Summon a Megalorca token. If Overflow is active for you, summon 2 instead. (Each one put onto the
// field triggers "whenever ... is put onto your field"; with room for one, one — rulings.)
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.summon(fx.game.overflow(fx.controller) ? ["Megalorca", "Megalorca"] : ["Megalorca"]);
      },
    }),
  ],
});
