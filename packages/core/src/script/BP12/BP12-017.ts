// BP12-017 Fairy Menhir — Forestcraft amulet, 1. 妖精.
// {[fanfare]} Look at the top 3 cards of your deck. You may reveal a Pixie card from among them and add
// it to your hand. Put the rest on the bottom of your deck in any order.
// Activate {[engage]}, bury this card: Give your leader {[defense]}+1. Activate only if there are at
// least 3 Pixie followers in your EX area.
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { and, isFollower } from "../targets";
import { countIn, pixie } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 3, { filter: pixie, to: "hand" });
      },
    }),
    activated(
      { engageSelf: true, burySelf: true },
      {
        condition: (g, c) => countIn(g, c, "ex", and(isFollower, pixie)) >= 3,
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 1);
        },
      },
    ),
  ],
});
