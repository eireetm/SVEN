// BP13-031 Mina, Levin Vice Leader (Evolved) — Swordcraft follower, 3/3. 指揮官・レヴィオン.
// On Evolve - Look at the top 4 cards of your deck. You may reveal a Levin card from among them and add it
// to your hand. Put the rest on the bottom of your deck in any order.
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { levin } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: levin, to: "hand" });
      },
    }),
  ],
});
