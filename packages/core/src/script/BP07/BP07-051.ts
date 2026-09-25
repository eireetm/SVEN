// BP07-051 Sagacious Core — Runecraft amulet, 1. 機械.
// {[fanfare]} Look at the top 2 cards of your deck. You may reveal a Machina card from among them and
// add it to your hand. Put rest on the bottom of your deck in any order.
// Activate {[engage]}, put this card into your cemetery: Deal 1 damage to each enemy leader.
// Activate only if you have at least 3 Machina cards in your EX area.
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { countIn, machina } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 2, { filter: machina, to: "hand" });
      },
    }),
    activated(
      { engageSelf: true, burySelf: true },
      {
        condition: (g, c) => countIn(g, c, "ex", machina) >= 3,
        *resolve(fx) {
          yield* fx.dealDamageEach([fx.game.leader(fx.game.opponent(fx.controller))], 1);
        },
      },
    ),
  ],
});
