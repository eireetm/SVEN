// BP11-061 Dragonfolk Artificer — Dragoncraft follower, 2, 2/3. 荒野・ドラゴニュート.
// {[fanfare]} Look at the top 3 cards of your deck. You may reveal a Wasteland card from among them and
// add it to your hand. Put the rest on the bottom of your deck in any order.
import { defineCard, fanfare, lookAtTopCards } from "../helpers";
import { wasteland } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 3, { filter: wasteland, to: "hand" });
      },
    }),
  ],
});
