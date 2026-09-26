// BP08-049 Rabbit Mage (Evolved) — Runecraft follower, 3/2. 魔法使い・獣.
// On Evolve - Look at the top 4 cards of your deck. You may reveal a card with Earth Rite from among
// them and add it to your hand. Put the rest on the bottom of your deck in any order.
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: (g, id) => g.hasEarthRite(id), to: "hand" });
      },
    }),
  ],
});
