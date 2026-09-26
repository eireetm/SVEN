// BP21-010 Elven Farmhand (Evolved) — 3/4.
// On Evolve - Look at the top 5 cards of your deck. You may summon up to two 1-cost Academic and/or Beast followers from
// among them. Put the rest on the bottom of your deck in any order. (元のコスト.)
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { costAtLeast, costAtMost } from "../targets";
import { academicOrBeastFollower } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 5, {
          filter: (g, id) => academicOrBeastFollower(g, id) && costAtLeast(1)(g, id) && costAtMost(1)(g, id),
          to: "field",
          max: 2,
        });
      },
    }),
  ],
});
