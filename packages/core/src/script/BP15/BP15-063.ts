// BP15-063 Mermaid of Punishment (Evolved) — Dragoncraft follower, 4/4. 海洋.
// On Evolve - Look at the top 5 cards of your deck. You may put up to 2 Marine cards from among them into your EX
// area. They cost 2 less to play this turn. Put the rest on the bottom of your deck in any order.
// Whenever another Marine follower is put onto your field, deal 1 damage to each enemy leader.
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { marine } from "./shared";
import { mermaidOfPunishment } from "./shared-dragon";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        for (const id of yield* lookAtTopCards(fx, 5, { filter: marine, to: "ex", max: 2 })) yield* fx.changePlayCost(id, -2, "endOfTurn");
      },
    }),
    mermaidOfPunishment(),
  ],
});
