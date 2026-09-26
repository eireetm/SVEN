// BP12-044 Rebel Against Fate — Runecraft spell, 7. 機械・超克.
// Banish this card. Each player returns their hand and cemetery to their deck, shuffles, then draws 5
// cards. The next card you play this turn costs 7 less. (Only its controller's next card — ruling. The
// players do each step at the same time, CR 1.3.4.1.)
import { defineCard, spell } from "../helpers";

export default defineCard({
  nextPlay: { any: () => true },
  abilities: [
    spell({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "resolution") yield* fx.banish([fx.self]);
        const players = [fx.game.activePlayer, fx.game.opponent(fx.game.activePlayer)];
        yield* fx.putOnDeck(players.flatMap((p) => [...fx.game.cards(p, "hand"), ...fx.game.cards(p, "cemetery")]), "top");
        for (const p of players) yield* fx.shuffleDeck(p);
        for (const p of players) yield* fx.draw(5, p);
        yield* fx.nextPlayCostsLess("any", 7);
      },
    }),
  ],
});
