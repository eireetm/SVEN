// BP05-095 Unidentified Subject (Evolved) — Havencraft follower, 3/7. 狂信.
// On Evolve: Draw 2 cards.
// Whenever you draw a card outside of your start phase, give this follower
// {[attack]}+1/{[defense]}+1.
import { defineCard, onEvolve } from "../helpers";
import { growsOnDraw } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.draw(2);
      },
    }),
    growsOnDraw,
  ],
});
