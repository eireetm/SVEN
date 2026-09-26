// BP10-096 Reverend Adjudicator (Evolved) — Havencraft follower, 3/3. アルカナ・信仰.
// On Evolve - Look at the top 4 cards of your deck. You may put a follower with Ward from among them
// into your EX area. It costs 1 less to play this turn. Put the rest on the bottom of your deck in any
// order.
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { isFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const moved = yield* lookAtTopCards(fx, 4, { filter: (g, id) => isFollower(g, id) && g.hasKeyword(id, "ward"), to: "ex" });
        for (const card of moved) yield* fx.changePlayCost(card, -1, "endOfTurn");
      },
    }),
  ],
});
