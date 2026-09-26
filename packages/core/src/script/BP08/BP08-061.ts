// BP08-061 Dragonsoul Princess — Dragoncraft follower, 3, 3/3. ドラゴニュート・プリンセス.
// {[fanfare]} Look at the top 5 cards. A Wyrmkin follower may go to your EX area; during Overflow
// it costs 3 less to play this turn. Put the rest on the bottom in any order (CR 5.11, 10.4.4.1,
// 13.4).
import { defineCard, fanfare, lookAtTopCards } from "../helpers";
import { and, hasTrait, isFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const moved = yield* lookAtTopCards(fx, 5, { filter: and(isFollower, hasTrait("竜族")), to: "ex" });
        if (fx.game.overflow(fx.controller)) {
          for (const card of moved) yield* fx.changePlayCost(card, -3, "endOfTurn");
        }
      },
    }),
  ],
});
