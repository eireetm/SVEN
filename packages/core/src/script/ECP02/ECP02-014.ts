// ECP02-014 Mio Honda [Cinderella Girl] (Evolved) — 3/3.
// On Evolve - Look at the top 2 cards of your deck. You may reveal an iM@S CG card from among them and add it to your hand. Put the
// rest on the bottom of your deck in any order.
// On Super-Evolve - You may summon a Passion follower that costs 6 or less from your hand. (元のコスト. Both trigger when it
// super-evolves, in any order — rulings.)
import { defineCard, lookAtTopCards, onEvolve, onSuperEvolve } from "../helpers";
import { costAtMost } from "../targets";
import { followerThat, imas, maySummonFromHand, passion } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 2, { filter: imas, to: "hand" });
      },
    }),
    onSuperEvolve({
      *resolve(fx) {
        yield* maySummonFromHand(fx, (g, id) => followerThat(passion)(g, id) && costAtMost(6)(g, id));
      },
    }),
  ],
});
