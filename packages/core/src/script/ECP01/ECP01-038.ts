// ECP01-038 Hishi Miracle (Evolved) — 3/3.
// At the start of your end phase, if there are at least 9 faceup cards named Carrot in your evolve deck, each opponent buries the
// top 20 cards of their deck. (Not the Carrots linked to racing followers; it resolves even if this left the field first — rulings.)
// On Evolve - Discard 2 Umamusume cards: Draw 2 cards.
import { discardMatching } from "../costs";
import { atStartOfYourEndPhase, defineCard, onEvolve } from "../helpers";
import { faceUpCarrots, umamusume } from "./shared";

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        if (faceUpCarrots(fx.game, fx.controller).length >= 9) yield* fx.mill(20, fx.game.opponent(fx.controller));
      },
    }),
    onEvolve({
      cost: discardMatching(umamusume, 2),
      *resolve(fx) {
        yield* fx.draw(2);
      },
    }),
  ],
});
