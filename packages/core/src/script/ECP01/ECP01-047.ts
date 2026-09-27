// ECP01-047 Satono Crown (Evolved) — 4/4.
// On Evolve - Look at the top 4 cards of your deck. You may put up to 2 Umamusume cards from among them into your EX area. Put
// the rest on the bottom of your deck in any order.
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { umamusume } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: umamusume, to: "ex", max: 2 });
      },
    }),
  ],
});
