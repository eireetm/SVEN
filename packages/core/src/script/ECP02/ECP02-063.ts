// ECP02-063 Eve Santaclaus [Cinderella Girl] — Havencraft follower, 1, 1/2. デレマス・パッション.
// {[fanfare]} Look at the top 2 cards of your deck. You may put any number of them on the top of your deck in any order. Put the rest
// on the bottom of your deck in any order.
// Activate, Lesson (2): Look at the top card of your deck. If it's an iM@S CG card, you may reveal it and add it to your hand.
// Activate only once per turn. (Not taken, it stays on top, unrevealed — ruling.)
import { lesson } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { imas, mayTakeTopCard } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const top = fx.topCards(2);
        const keep = yield* fx.chooseCards(top, 0, top.length);
        yield* fx.bottomInAnyOrder(top.filter((id) => !keep.includes(id)));
        yield* fx.putOnDeckInAnyOrder(keep, "top");
      },
    }),
    activated(
      { custom: lesson(2) },
      {
        oncePerTurn: true,
        *resolve(fx) {
          yield* mayTakeTopCard(fx, imas);
        },
      },
    ),
  ],
});
