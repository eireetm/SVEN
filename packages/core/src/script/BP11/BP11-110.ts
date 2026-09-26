// BP11-110 Wandering Chef (Evolved) — Neutral follower, 3/3. 荒野・コック.
// On Evolve - Look at the top 4 cards of your deck. You may reveal a Wasteland card from among them and
// add it to your hand. Put the rest on the bottom of your deck in any order.
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { wasteland } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: wasteland, to: "hand" });
      },
    }),
  ],
});
