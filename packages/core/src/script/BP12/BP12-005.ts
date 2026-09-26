// BP12-005 Carbuncle, Immortal Jewel (Evolved) — Forestcraft follower, 4/4. 精霊・獣.
// On Evolve - Put a Carbuncle's Sparkle token into your EX area. Give each Carbuncle's Sparkle token in
// your EX area "This card costs 2 less to play." (Evolving it twice gives two of them: 4 less —
// rulings.)
import { defineCard, onEvolve } from "../helpers";
import { named } from "../targets";
import { SPARKLE } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.tokensToEx([SPARKLE]);
        for (const id of fx.game.cards(fx.controller, "ex")) {
          if (named(SPARKLE)(fx.game, id)) yield* fx.changePlayCost(id, -2);
        }
      },
    }),
  ],
});
