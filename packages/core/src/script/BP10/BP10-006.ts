// BP10-006 Chipper Skipper (Evolved) — Forestcraft follower, 2/2. アルカナ・エルフ族.
// On Evolve - Look at the top 4 cards of your deck. You may put a follower that costs 2 or less from
// among them into your EX area. It costs 2 less to play this turn. Put the rest on the bottom of your
// deck in any order. (元のコスト.)
// Whenever a Mercenary follower is put onto your field, give it {[attack]}+1/{[defense]}+1 and Rush.
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { and, costAtMost, isFollower } from "../targets";
import { mercenaryGetsRush } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const moved = yield* lookAtTopCards(fx, 4, { filter: and(isFollower, costAtMost(2)), to: "ex" });
        for (const card of moved) yield* fx.changePlayCost(card, -2, "endOfTurn");
      },
    }),
    mercenaryGetsRush,
  ],
});
