// BP18-054 Carbuncle of Mysteria (Evolved) — 3/3.
// On Evolve - Look at the top 2 cards of your deck. You may reveal an Academic card from among them and add it to your
// hand. Bury the rest.
// {[lastwords]} Bury the top card of your deck.
import { defineCard, lastWords, lookAtTopCards, onEvolve } from "../helpers";
import { academic } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 2, { filter: academic, to: "hand", rest: "cemetery" });
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.mill(1);
      },
    }),
  ],
});
