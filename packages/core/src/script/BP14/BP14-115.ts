// BP14-115 Stay in Paradise — Neutral spell, 1. 宴楽.
// Look at the top 4 cards of your deck. You may put a Festive card from among them into your EX area. Put the
// rest on the bottom of your deck in any order.
import { defineCard, lookAtTopCards, spell } from "../helpers";
import { festive } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: festive, to: "ex" });
      },
    }),
  ],
});
