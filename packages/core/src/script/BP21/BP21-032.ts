// BP21-032 Kitty Sergeant (Evolved) — 3/3.
// Whenever another follower is put onto your field, give your leader {[defense]}+1.
// On Evolve - Look at the top 4 cards of your deck. You may summon a follower that costs 4 or less from among them. Put the
// rest on the bottom of your deck in any order. (元のコスト.)
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { costAtMost, isFollower } from "../targets";
import { kittyLeader } from "./shared-sword";

export default defineCard({
  abilities: [
    kittyLeader,
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: (g, id) => isFollower(g, id) && costAtMost(4)(g, id), to: "field" });
      },
    }),
  ],
});
