// BP11-067 Wavecrest Angler — Dragoncraft follower, 2, 2/3. 海洋.
// {[fanfare]} Look at the top 3 cards of your deck. You may put a Marine card from among them into your
// EX area. Put the rest on the bottom of your deck in any order.
import { defineCard, fanfare, lookAtTopCards } from "../helpers";
import { marine } from "./shared-dragon";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 3, { filter: marine, to: "ex" });
      },
    }),
  ],
});
