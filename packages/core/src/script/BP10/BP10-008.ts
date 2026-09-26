// BP10-008 Treacherous Reversal — Forestcraft spell, 8. アルカナ・精霊.
// Destroy each card on the field. Each player buries each card in their EX area. Discard your hand.
// Look at the top 5 cards of your deck. You may put any number of them into your EX area. Bury the
// rest. (Both players' fields and EX areas — ruling.)
import { defineCard, lookAtTopCards, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const players = [fx.controller, fx.game.opponent(fx.controller)];
        yield* fx.destroy(players.flatMap((p) => fx.game.cards(p, "field")));
        yield* fx.bury(players.flatMap((p) => fx.game.cards(p, "ex")));
        yield* fx.discardHand();
        yield* lookAtTopCards(fx, 5, { filter: () => true, to: "ex", max: 5, rest: "cemetery" });
      },
    }),
  ],
});
