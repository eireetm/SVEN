// BP03-015 Tweedle Dum, Tweedle Dee (Evolved) — Forestcraft, 3/3.
// On Evolve: Look at the top 4 cards. You may reveal a card that costs exactly 1 and add it
// to your hand. Put the rest on the bottom in any order.
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, {
          filter: (g, id) => g.info(id).cost === 1,
          to: "hand",
        });
      },
    }),
  ],
});
