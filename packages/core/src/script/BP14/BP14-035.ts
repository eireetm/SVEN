// BP14-035 Haggler's Gambit — Swordcraft spell, 1. 商人.
// This costs 1 less to play if there are at least 3 cards in your EX area named Glittering Gold.
// ----------
// Draw a card. Put a Glittering Gold token into your EX area.
import { defineCard, spell } from "../helpers";
import { named } from "../targets";
import { countIn, GLITTERING_GOLD } from "./shared";

export default defineCard({
  playCost: (g, _self, p) => (countIn(g, p, "ex", named(GLITTERING_GOLD)) >= 3 ? -1 : 0),
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.draw(1);
        yield* fx.tokensToEx([GLITTERING_GOLD]);
      },
    }),
  ],
});
