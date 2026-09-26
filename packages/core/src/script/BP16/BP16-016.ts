// BP16-016 Fay Twinkletoes — Forestcraft follower, 3, 2/2. 妖精.
// {[fanfare]} Give each other {[forestcraft]} follower on your field {[attack]}+1/{[defense]}+1.
import { defineCard, fanfare } from "../helpers";
import { isClass } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        for (const id of fx.game.followers(fx.controller)) {
          if (id !== fx.self && isClass("Forestcraft")(fx.game, id)) yield* fx.giveStats(id, 1, 1);
        }
      },
    }),
  ],
});
