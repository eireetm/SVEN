// BP14-109 Glistering Angel (Evolved) — Neutral follower, 3/3. 天使.
// Ward.
// On Evolve - Look at the top 4 cards of your deck. You may reveal an Angel or Fallen Angel card from among them
// and add it to your hand. Put the rest on the bottom of your deck in any order.
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { hasTrait } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: (g, id) => hasTrait("天使")(g, id) || hasTrait("堕天使")(g, id), to: "hand" });
      },
    }),
  ],
});
