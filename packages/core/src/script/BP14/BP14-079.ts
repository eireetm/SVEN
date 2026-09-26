// BP14-079 Briared Vampire (Evolved) — Abysscraft follower, 2/2. 吸血鬼.
// On Evolve - Put the top card of your deck into your EX area. Discard a card. (The discard happens with a full
// EX area too — ruling.)
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.topToEx(1);
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
  ],
});
