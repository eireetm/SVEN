// BP07-085 Sanguine Core — Abysscraft amulet, 1. 機械.
// {[fanfare]} Look at the top 2 cards of your deck. You may reveal a Machina card from among them and
// add it to your hand. Put the rest on the bottom of your deck in any order.
// Activate {[engage]}, bury this card: Put an Assembly Droid token into your EX area. Activate only if
// you have at least 5 Machina cards in your cemetery.
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { DROID, countIn, machina } from "./shared";

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
        condition: (g, c) => countIn(g, c, "cemetery", machina) >= 5,
        *resolve(fx) {
          yield* fx.tokensToEx([DROID]);
        },
      },
    ),
  ],
});
