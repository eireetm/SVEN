// BP12-103 Natur Al'machinus — Neutral follower, 5, 4/4. 機械・自然・大神.
// When this card is discarded, engage a Naterran Great Tree on your field: Select a Natura card not named
// Natur Al'machinus in your cemetery and add it to your hand. (The process is optional; also at the hand
// limit — rulings.)
// ----------
// {[fanfare]} Look at the top 3 cards of your deck. You may reveal a Machina card from among them and add
// it to your hand. Put the rest on the bottom of your deck in any order. Put a Repair Mode token into your
// EX area. Recover 3 play points.
import { defineCard, fanfare, lookAtTopCards, whenDiscarded } from "../helpers";
import { engageYourCards } from "../costs";
import { inYourZone, named } from "../targets";
import { REPAIR, isTree, machina, natura } from "./shared";

const self = named("Natur Al'machinus");

export default defineCard({
  abilities: [
    whenDiscarded({
      cost: engageYourCards(isTree, 1),
      targets: [inYourZone("cemetery", { filter: (g, id) => natura(g, id) && !self(g, id) })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
      },
    }),
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 3, { filter: machina, to: "hand" });
        yield* fx.tokensToEx([REPAIR]);
        yield* fx.recoverPlayPoints(3);
      },
    }),
  ],
});
