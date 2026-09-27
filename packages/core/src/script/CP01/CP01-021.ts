// CP01-021 Trial Initiation — Swordcraft spell, 1. ウマ娘・BNW.
// Choose one of the following. (1) Look at the top 2 cards of your deck. You may reveal an Umamusume card from among them and
// add it to your hand. Put the remaining cards on the bottom of your deck in any order. (2) Select a BNW follower in your
// cemetery and add it to your hand. ((2) needs its target, CR 5.18.3.1.2.)
import { defineCard, lookAtTopCards, spell } from "../helpers";
import { and, inYourZone, isFollower } from "../targets";
import { bnw, umamusume } from "./shared";

export default defineCard({
  abilities: [
    spell({
      modes: [
        {
          id: "look",
          label: "(1) An Umamusume card from the top 2",
          *resolve(fx) {
            yield* lookAtTopCards(fx, 2, { filter: umamusume, to: "hand" });
          },
        },
        {
          id: "bnw",
          label: "(2) A BNW follower from your cemetery",
          targets: [inYourZone("cemetery", { filter: and(isFollower, bnw) })],
          *resolve(fx) {
            yield* fx.returnToHand(fx.targets[0]!);
          },
        },
      ],
    }),
  ],
});
