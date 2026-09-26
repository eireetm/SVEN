// BP21-113 Arriet, Luxvoice Learner — Neutral follower, 2, 2/3. 学院・シンガー.
// {[fanfare]} Look at the top 3 cards of your deck. You may reveal an Academic card from among them and add it to your hand.
// Put the rest on the bottom of your deck in any order. If there are at least 3 Academic followers on your field, give this
// {[attack]}+1.
import { defineCard, fanfare, lookAtTopCards } from "../helpers";
import { academic, academicFollower } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        yield* lookAtTopCards(fx, 3, { filter: academic, to: "hand" });
        if (g.card(fx.self)?.zone === "field" && g.followers(fx.controller).filter((id) => academicFollower(g, id)).length >= 3) {
          yield* fx.giveStats(fx.self, 1, 0);
        }
      },
    }),
  ],
});
