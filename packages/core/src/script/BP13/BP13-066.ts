// BP13-066 Margarite Mermaid (Evolved) — Dragoncraft follower, 3/3. 海洋.
// On Evolve - Look at the top 4 cards of your deck. You may put a Marine card from among them into your EX
// area. Put the rest on the bottom of your deck in any order.
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { hasTrait } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: hasTrait("海洋"), to: "ex" });
      },
    }),
  ],
});
