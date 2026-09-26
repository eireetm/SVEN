// BP17-083 Roly-Poly Mk II — Abysscraft follower, 2, 1/3. 機械・魔界.
// Ward.
// {[fanfare]} Look at the top 2 cards of your deck. You may reveal a Machina card from among them and add it to your hand.
// Bury the rest.
import { defineCard, fanfare, lookAtTopCards } from "../helpers";
import { machina } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 2, { filter: machina, to: "hand", rest: "cemetery" });
      },
    }),
  ],
});
