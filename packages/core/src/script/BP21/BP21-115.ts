// BP21-115 Goblin Genius — Neutral follower, 1, 2/2. 学院・ゴブリン.
// {[fanfare]} If there are at least 3 Academic followers on your field, give your leader {[defense]}+1. (This one counts.)
import { defineCard, fanfare } from "../helpers";
import { academicFollower } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        if (g.followers(fx.controller).filter((id) => academicFollower(g, id)).length >= 3) yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
