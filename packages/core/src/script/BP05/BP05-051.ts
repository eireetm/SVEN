// BP05-051 Metaproduction — Runecraft spell, 1. 魔法使い・超克.
// Quick.
// Look at the top 2 cards of your deck. You may reveal a spell from among them and add it to your
// hand. Put the remaining cards on the bottom of your deck in any order.
import { defineCard, lookAtTopCards, spell } from "../helpers";
import { isSpell } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 2, { filter: isSpell, to: "hand" });
      },
    }),
  ],
});
