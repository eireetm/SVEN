// BP20-103 Temple of Repose — Havencraft amulet, 1. 絶傑・狂信.
// {[fanfare]} Look at the top 3 cards of your deck. You may reveal a card with Omen and Zealot traits from among them and add
// it to your hand. Put the rest on the bottom of your deck in any order.
// {[q]}Activate {[cost01]}, engage this, bury this: Reduce the next damage your leader takes this turn by 2. Activate only if
// you have at least 3 Crests in your EX area. (Twice: the next damage -4; one finding it already at 0 stays — rulings.)
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { omenZealot } from "./shared";
import { threeCrests } from "./shared-haven";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 3, { filter: omenZealot, to: "hand" });
      },
    }),
    activated(
      { playPoints: 1, engageSelf: true, burySelf: true },
      {
        quick: true,
        condition: threeCrests,
        *resolve(fx) {
          yield* fx.reduceNextDamage(fx.game.leader(fx.controller), 2, "endOfTurn");
        },
      },
    ),
  ],
});
