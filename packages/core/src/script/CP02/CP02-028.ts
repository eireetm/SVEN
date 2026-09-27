// CP02-028 Sparkling☆Days — Swordcraft spell, 1. デレマス・クール.
// Look at the top 2 cards of your deck. You may reveal a Cool or Passion card from among them and add it to your hand. Put the
// rest on the bottom of your deck in any order.
import { defineCard, lookAtTopCards, spell } from "../helpers";
import { cool, passion } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 2, { filter: (g, id) => cool(g, id) || passion(g, id), to: "hand" });
      },
    }),
  ],
});
