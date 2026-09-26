// BP20-012 Hamlet of Unkilling — Forestcraft amulet, 1. 絶傑・狩人.
// {[fanfare]} Look at the top 2 cards of your deck. You may reveal a card with Omen and Hunter traits and add it to your
// hand. Put the rest on the bottom of your deck in any order.
// Activate {[engage]} this, bury this: Give your leader {[defense]}+1. Activate only if there are at least 3 Hunter cards
// in your cemetery. (The engage is in the Japanese and official English texts; the English one leaves it out.)
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { huntersInCemetery, omenHunter } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 2, { filter: omenHunter, to: "hand" });
      },
    }),
    activated(
      { engageSelf: true, burySelf: true },
      {
        condition: (g, c) => huntersInCemetery(g, c) >= 3,
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 1);
        },
      },
    ),
  ],
});
