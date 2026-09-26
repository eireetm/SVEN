// BP15-040 Lishenna, Melodious Destruction (Evolved) — Runecraft follower, 4/4. 絶傑・アイドル.
// On Evolve - Look at the top 4 cards of your deck. You may put up to 2 Idolatry cards from among them into your
// EX area. Put the rest on the bottom of your deck in any order.
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { idolatry } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: idolatry, to: "ex", max: 2 });
      },
    }),
  ],
});
