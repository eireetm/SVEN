// BP21-114 Lainecrest Academy — Neutral amulet, 1. 学院.
// {[fanfare]} Look at the top 3 cards of your deck. You may reveal an Academic card from among them and add it to your hand.
// Put the rest on the bottom of your deck in any order.
// Activate {[engage]} this, bury this: Give your leader {[defense]}+1. Activate only if there at least 2 Academic followers on
// your field.
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { academic, academicFollower } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 3, { filter: academic, to: "hand" });
      },
    }),
    activated(
      { engageSelf: true, burySelf: true },
      {
        condition: (g, c) => g.followers(c).filter((id) => academicFollower(g, id)).length >= 2,
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 1);
        },
      },
    ),
  ],
});
