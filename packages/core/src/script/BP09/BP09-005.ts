// BP09-005 Paula, Gentle Warmth — Forestcraft follower, 3/3. 妖精. The front face of a double-faced
// evolved card; its back face is BP09-005_back Paula, Passionate Warmth (CR 2.14).
// On Evolve - Look at the top 5 cards of your deck. You may reveal a {[forestcraft]} spell from among
// them and add it to your hand. Put the rest on the bottom of your deck in any order.
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { forestSpell } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 5, { filter: forestSpell, to: "hand" });
      },
    }),
  ],
});
