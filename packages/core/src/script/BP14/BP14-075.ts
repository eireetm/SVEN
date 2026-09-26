// BP14-075 Anisage, Lost Forsaken (Evolved) — Abysscraft follower, 3/3. 宴楽・死者.
// On Evolve - Look at the top 4 cards of your deck. You may put a Festive card from among them into your EX
// area. Put the rest on the bottom of your deck in any order.
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { festive } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: festive, to: "ex" });
      },
    }),
  ],
});
