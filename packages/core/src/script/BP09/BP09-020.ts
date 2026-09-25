// BP09-020 Spartacus — Swordcraft follower, 5, 4/6. 指揮官.
// Ward.
// At the start of your end phase, discard any number of cards and draw that many cards plus 1. Then,
// if there's 1 card or less in your deck, you win the game.
// Rulings: 0 cards may be discarded (then draw 1); the deck is checked right after drawing, before
// abilities triggered by the discard resolve; with an empty deck you win before losing for drawing
// from it (CR 11.2 comes later, at Confirmation Timing); "opponents can't win" (BP05-092) prevails
// (CR 1.3.3, fx.winGame).
import { atStartOfYourEndPhase, defineCard } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        const discarded = yield* fx.discard(fx.controller, 0, fx.game.cards(fx.controller, "hand").length);
        yield* fx.draw(discarded.length + 1);
        if (fx.game.cards(fx.controller, "deck").length <= 1) yield* fx.winGame();
      },
    }),
  ],
});
