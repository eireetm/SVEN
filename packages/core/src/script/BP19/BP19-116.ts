// BP19-116 Azvaldt — Neutral amulet, 1. 八獄.
// {[fanfare]} Look at the top 4 cards of your deck. You may reveal a Condemned card from among them and add it to your hand.
// Put the rest on the bottom of your deck in any order. ("card" — the Japanese and Chinese texts; the official English
// text says "follower".)
// Activate {[engage]} this and bury it: If it's your 8th turn or later, draw a card. (CR 3.3.2 turns passed; it may be
// activated earlier and only buried — ruling.)
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { condemned } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: condemned, to: "hand" });
      },
    }),
    activated(
      { engageSelf: true, burySelf: true },
      {
        *resolve(fx) {
          if (fx.game.turnsPassed(fx.controller) >= 8) yield* fx.draw(1);
        },
      },
    ),
  ],
});
