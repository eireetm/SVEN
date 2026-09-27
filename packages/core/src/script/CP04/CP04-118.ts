// CP04-118 Call of the Guild — Neutral spell, 1. プリコネ・ギルド管理協会.
// Look at the top 4 cards of your deck. You may put a PriConne follower from among them into your EX area. Put the rest on the
// bottom of your deck in any order. (The scraped official English text belongs to another card.)
import { defineCard, lookAtTopCards, spell } from "../helpers";
import { priconneFollower } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: priconneFollower, to: "ex" });
      },
    }),
  ],
});
