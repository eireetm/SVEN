// BP01-032 Alwida's Command — Swordcraft spell, 5.
// Summon a Viking, Steelclad Knight, and Knight token. (If they do not all fit, the player
// chooses which enter — rulings, CR 4.4.4.2.)
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.summon(["Viking", "Steelclad Knight", "Knight"]);
      },
    }),
  ],
});
