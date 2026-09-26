// BP10-073 Dragon Spawning — Dragoncraft spell, 2. 竜族.
// Look at the top 3 cards of your deck. You may put a {[dragoncraft]} follower from among them into your
// EX area. If Overflow is active for you, it costs 2 less to play this turn. Put the rest on the bottom
// of your deck in any order.
import { defineCard, lookAtTopCards, spell } from "../helpers";
import { and, isClass, isFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const moved = yield* lookAtTopCards(fx, 3, { filter: and(isFollower, isClass("Dragoncraft")), to: "ex" });
        if (fx.game.overflow(fx.controller)) for (const card of moved) yield* fx.changePlayCost(card, -2, "endOfTurn");
      },
    }),
  ],
});
