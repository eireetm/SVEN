// BP07-099 Dark Bishop (Evolved) — 4/4.
// On Evolve - Look at the top 5 cards of your deck. From among them, you may summon a Fable follower
// that costs 5 or less or Fable amulet that costs 5 or less. Put the rest on the bottom of your deck
// in any order. (元のコスト.)
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { and, costAtMost, isAmulet, isFollower } from "../targets";
import { fable } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 5, {
          filter: (g, id) => (isFollower(g, id) || isAmulet(g, id)) && and(fable, costAtMost(5))(g, id),
          to: "field",
        });
      },
    }),
  ],
});
