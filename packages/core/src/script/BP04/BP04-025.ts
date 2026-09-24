// BP04-025 Perseus — Swordcraft follower, 1, 2/2. 指揮官・星神.
// {[fanfare]} If there are at least 4 followers on your field (including this one), give this
// follower +1/+1.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        if (fx.game.followers(fx.controller).length >= 4) yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
  ],
});
