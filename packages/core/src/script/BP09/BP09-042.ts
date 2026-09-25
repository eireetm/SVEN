// BP09-042 Bergent, Onion Patchmaster — Runecraft follower, 3, 3/3. 魔法使い・魔法生物.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Look at the top 5 cards of your deck. You may summon up to 2 cards named Onion Patch from
// among them. Put the rest on the bottom of your deck in any order.
import { defineCard, evolveAbility, fanfare, lookAtTopCards } from "../helpers";
import { named } from "../targets";
import { ONION } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 5, { filter: named(ONION), to: "field", max: 2 });
      },
    }),
  ],
});
