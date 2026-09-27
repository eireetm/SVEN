// SD03-009 Penguin Wizard (Evolved) — 2/5.
// On Evolve: Refresh this card.
// Activate {[engage]}, discard a spell: Draw a card.
import { activated, defineCard, onEvolve } from "../helpers";
import { discardA } from "../costs";
import { isSpell } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.refresh([fx.self]);
      },
    }),
    activated(
      { engageSelf: true, custom: discardA(isSpell) },
      {
        *resolve(fx) {
          yield* fx.draw(1);
        },
      },
    ),
  ],
});
