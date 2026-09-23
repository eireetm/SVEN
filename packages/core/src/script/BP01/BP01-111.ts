// BP01-111 Crazed Executioner (Evolved) — 3/3.
// On Evolve: Deal 2 damage to your leader. Select an opponent. They reveal their hand. Select a
// card in their hand. The opponent discards that card.
// (The 2 damage happens even with an empty hand; Aura does not protect cards in hand — rulings.)
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.controller), 2);
        const opp = fx.game.opponent(fx.controller);
        const hand = fx.game.cards(opp, "hand");
        yield* fx.reveal(hand); // CR 5.21
        yield* fx.discardCards(yield* fx.chooseCards(hand, 1, 1)); // CR 5.12, discarded by its owner
      },
    }),
  ],
});
