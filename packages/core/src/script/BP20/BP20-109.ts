// BP20-109 Peckish Al-mi'raj — Havencraft follower, 2, 2/3. 獣.
// {[fanfare]} Look at the top 3 cards of your deck. You may put a Beast follower from among them into your EX area. Put the
// rest on the bottom of your deck in any order.
import { defineCard, fanfare, lookAtTopCards } from "../helpers";
import { isFollower } from "../targets";
import { beast } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 3, { filter: (g, id) => isFollower(g, id) && beast(g, id), to: "ex" });
      },
    }),
  ],
});
