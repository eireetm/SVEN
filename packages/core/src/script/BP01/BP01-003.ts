// BP01-003 Ancient Elf (Evolved) — 3/3.
// Ward. // On Evolve, return another card on your field to its owner's hand: Give this follower +1/+1.
import { defineCard, onEvolve } from "../helpers";
import { returnAnotherCardOnYourField } from "../costs";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      cost: returnAnotherCardOnYourField,
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
  ],
});
