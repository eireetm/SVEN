// ECP02-016 Karen Hojo [Cinderella Girl] — Swordcraft follower, 1, 1/1. デレマス・クール.
// {[fanfare]} Look at the top card of your deck. If it's a Cool card, you may reveal it and add it to your hand. (Not taken, it
// stays on top, unrevealed — ruling.)
// {[lastwords]} Put a Magical Item token into your EX area.
import { defineCard, fanfare, lastWords } from "../helpers";
import { cool, magicalItems, mayTakeTopCard } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* mayTakeTopCard(fx, cool);
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* magicalItems(fx);
      },
    }),
  ],
});
