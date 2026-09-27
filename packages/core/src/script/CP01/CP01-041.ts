// CP01-041 Special Week (Evolved) — 3/3.
// On Evolve: If Overflow is active for you, give each other Umamusume follower on your field {[attack]}+1/{[defense]}+1.
// (CR 13.4.1.2.)
import { defineCard, onEvolve } from "../helpers";
import { umamusumeFollower } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const g = fx.game;
        if (!g.overflow(fx.controller)) return;
        for (const id of g.followers(fx.controller).filter((f) => f !== fx.self && umamusumeFollower(g, f))) yield* fx.giveStats(id, 1, 1);
      },
    }),
  ],
});
