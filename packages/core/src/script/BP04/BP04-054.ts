// BP04-054 Astrologist of the Mist — Runecraft follower, 5, 5/5. 魔法使い・星神.
// Ward.
// {[fanfare]}, Earth Rite: Give each follower on your field +1/+1 (this one included — ruling).
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      earthRite: { mode: "required" },
      *resolve(fx) {
        for (const id of fx.game.followers(fx.controller)) yield* fx.giveStats(id, 1, 1);
      },
    }),
  ],
});
