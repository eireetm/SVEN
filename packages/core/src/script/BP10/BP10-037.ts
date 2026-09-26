// BP10-037 0. Lhynkal, The Fool — Runecraft follower, 2, 2/2. アルカナ・魔法使い.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Look at the top 5 cards of your deck. From among them, you may reveal up to 2 Arcana
// spells and add them to your hand. Put the rest on the bottom of your deck in any order.
import { defineCard, evolveAbility, fanfare, lookAtTopCards } from "../helpers";
import { arcanaSpell } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 5, { filter: arcanaSpell, to: "hand", max: 2 });
      },
    }),
  ],
});
