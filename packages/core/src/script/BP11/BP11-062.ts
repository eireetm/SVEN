// BP11-062 Draconic Call — Dragoncraft spell, 2. 竜族.
// {[quick]}
// Look at the top 5 cards of your deck. From among them, you may reveal up to 2 {[dragoncraft]} cards
// that cost 7 or more and add them to your hand. Put the rest on the bottom of your deck in any order.
import { defineCard, lookAtTopCards, spell } from "../helpers";
import { bigDragon } from "./shared-dragon";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 5, { filter: bigDragon, to: "hand", max: 2 });
      },
    }),
  ],
});
