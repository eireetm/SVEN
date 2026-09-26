// BP11-053 Reggie, Peerless Artisan (Evolved) — Dragoncraft follower, 3/3. 荒野・竜族.
// While Overflow is active for you, this follower has Storm.
// On Evolve - Give each other Wasteland follower on your field {[attack]}+1.
import { defineCard, onEvolve } from "../helpers";
import { wastelandFollower } from "./shared";
import { stormWithOverflow } from "./shared-dragon";

export default defineCard({
  selfKeywords: stormWithOverflow,
  abilities: [
    onEvolve({
      *resolve(fx) {
        for (const id of fx.game.followers(fx.controller)) if (id !== fx.self && wastelandFollower(fx.game, id)) yield* fx.giveStats(id, 1, 0);
      },
    }),
  ],
});
