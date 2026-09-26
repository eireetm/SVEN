// BP17-014 Blossom Treant (Evolved) — Forestcraft follower, 5/8. 精霊.
// Ward.
// On Evolve - Give your leader {[defense]}+4.
// {[lastwords]} Draw a card.
import { defineCard, lastWords, onEvolve } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 4);
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
