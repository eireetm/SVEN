// BP14-069 Aquatic Authority — Dragoncraft spell, 1. 竜使い・海洋.
// Look at the top 3 cards of your deck. You may put a Marine card from among them into your EX area. If
// Overflow is active for you, it costs 1 less to play this turn. Put the rest on the bottom of your deck in
// any order.
import { defineCard, lookAtTopCards, spell } from "../helpers";
import { marine } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const cheaper = fx.game.overflow(fx.controller);
        for (const id of yield* lookAtTopCards(fx, 3, { filter: marine, to: "ex" })) {
          if (cheaper) yield* fx.changePlayCost(id, -1, "endOfTurn");
        }
      },
    }),
  ],
});
