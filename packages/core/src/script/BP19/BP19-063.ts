// BP19-063 Warden of the Adamant Claw — Dragoncraft follower, 1, 0/1. 八獄・竜族.
// This can't be played from the EX area.
// Ward.
// {[fanfare]} Look at the top 4 cards of your deck. You may reveal a Condemned card from among them and add it to your hand.
// Put the rest on the bottom of your deck in any order.
// {[lastwords]} Put this into its owner's EX area.
import { defineCard, fanfare, lookAtTopCards } from "../helpers";
import { condemned } from "./shared";
import { backToEx, notFromEx } from "./shared-dragon";

export default defineCard({
  keywords: ["ward"],
  playableIf: notFromEx,
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: condemned, to: "hand" });
      },
    }),
    backToEx,
  ],
});
