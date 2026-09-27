// CP02-050 Tomoe Murakami — Runecraft follower, 6, 5/5. デレマス・パッション.
// When playing this card, discard a card: This card costs 2 less to play. (Its original cost stays 6, e.g. for CP02-044 —
// ruling. Abilities of the discarded card and this card's Fanfare resolve in the order the player chooses — ruling.)
// ----------
// {[fanfare]} Search your deck for up to 2 spells with different names, reveal them, add them to your hand, then shuffle your
// deck.
import { discardA } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { isSpell } from "../targets";

export default defineCard({
  playOptions: [{ id: "discard", label: "Discard a card: costs 2 less", costDelta: -2, ...discardA(() => true) }],
  abilities: [
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.search((id) => isSpell(g, id), { max: 2, distinctNames: true });
      },
    }),
  ],
});
