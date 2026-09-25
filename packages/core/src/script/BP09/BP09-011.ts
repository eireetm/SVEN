// BP09-011 Blessings of Creation — Forestcraft spell, 1. 精霊・植物族・光輝. Quick.
// Draw a card. If there are at least 5 {[forestcraft]} spells with different names in your cemetery,
// give your leader {[defense]}+2. (This spell is not in the cemetery while it resolves — ruling.)
import { defineCard, spell } from "../helpers";
import { fiveForestSpellNames } from "./shared";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.draw(1);
        if (fiveForestSpellNames(fx.game, fx.controller)) yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
