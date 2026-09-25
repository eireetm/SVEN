// BP07-059 Bubbleborne Mermaid — Dragoncraft follower, 2, 2/3. 海洋.
// {[fanfare]} Give your leader {[defense]}+1 for every Marine follower on your field. (This one too.)
import { defineCard, fanfare } from "../helpers";
import { marine } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const x = fx.game.followers(fx.controller).filter((id) => marine(fx.game, id)).length;
        if (x > 0) yield* fx.giveLeaderDefense(fx.controller, x);
      },
    }),
  ],
});
