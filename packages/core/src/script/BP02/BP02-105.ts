// BP02-105 Emerald Maiden — Havencraft follower, 3, 3/4.
// Ward.
// {[fanfare]} Give this follower {[defense]}+X. X equals the number of other followers with Ward on
// your field (not counting itself — ruling).
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        const x = fx.game.followers(fx.controller).filter((id) => id !== fx.self && fx.game.hasKeyword(id, "ward")).length;
        yield* fx.giveStats(fx.self, 0, x);
      },
    }),
  ],
});
