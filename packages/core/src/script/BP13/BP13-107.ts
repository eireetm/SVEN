// BP13-107 Planetary Fracture — Neutral spell, 8. 大神・魔王・キラー.
// Banish each card on the field and in the EX area. Each player banishes the top 10 cards of their deck.
// (Both players' — ruling; each player's at the same time, CR 1.3.4.)
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const g = fx.game;
        const players = [fx.controller, g.opponent(fx.controller)];
        yield* fx.banish(players.flatMap((p) => [...g.cards(p, "field"), ...g.cards(p, "ex")]));
        yield* fx.banish(players.flatMap((p) => fx.topCards(10, p)));
      },
    }),
  ],
});
