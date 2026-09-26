// BP15-081 Yuzuki, Bloodlord (Evolved) — Abysscraft follower, 3/3. 魔界.
// On Evolve - Look at the top 2 cards of your deck. You may put a 2-cost card from among them into your EX area. It
// costs 2 less to play this turn. Put the rest on the bottom of your deck in any order. (元のコスト.)
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { costs2 } from "./shared-abyss";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        for (const id of yield* lookAtTopCards(fx, 2, { filter: costs2, to: "ex" })) yield* fx.changePlayCost(id, -2, "endOfTurn");
      },
    }),
  ],
});
