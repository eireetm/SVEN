// BP07-101 Saintly Core — Havencraft amulet, 1. 機械.
// {[fanfare]} Look at the top 2 cards of your deck. You may reveal a Machina card from among them and
// add it to your hand. Put the rest on the bottom of your deck in any order.
// Activate {[engage]}, bury this card: Put a Repair Mode token into your EX area. Activate only if you
// have at least 2 Machina followers on your field.
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { REPAIR, machina } from "./shared";

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
        condition: (g, c) => g.followers(c).filter((id) => machina(g, id)).length >= 2,
        *resolve(fx) {
          yield* fx.tokensToEx([REPAIR]);
        },
      },
    ),
  ],
});
