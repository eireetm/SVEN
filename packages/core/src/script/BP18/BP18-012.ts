// BP18-012 Blossoming Lunerian (Evolved) — 2/2.
// On Evolve - Look at the top 3 cards of your deck. You may put a Beast card from among them into your EX area. Put the
// rest on the bottom of your deck in any order.
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { beast } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 3, { filter: beast, to: "ex" });
      },
    }),
  ],
});
