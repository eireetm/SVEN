// BP18-109 Guiding Words — Havencraft spell, 1. 透京・信仰.
// Draw a card. If there's a Togh Keyoh follower on your field, give your leader {[defense]}+1.
import { defineCard, spell } from "../helpers";
import { toghKeyohFollowers } from "./shared-haven";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.draw(1);
        if (toghKeyohFollowers(fx.game, fx.controller) > 0) yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
