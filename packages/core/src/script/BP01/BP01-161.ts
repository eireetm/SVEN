// BP01-161 Altered Fate — Neutral spell, 2.
// Each player returns their hand to their deck, shuffles it, and draws X cards. X equals the
// number of cards they returned to their deck. You draw 1 more card. (Playable with empty hands
// — ruling; processes without choices happen for both players together, CR 1.3.4.1.)
import { defineCard, spell } from "../helpers";
import type { PlayerId } from "../../model/ids";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const players: PlayerId[] = [fx.controller, fx.game.opponent(fx.controller)];
        const returned = players.map((p) => fx.game.cards(p, "hand"));
        for (const hand of returned) yield* fx.putOnDeck(hand, "bottom");
        for (const p of players) yield* fx.shuffleDeck(p);
        for (const [i, p] of players.entries()) yield* fx.draw(returned[i]!.length + (p === fx.controller ? 1 : 0), p);
      },
    }),
  ],
});
