// BP06-020 Ralmia, Sonic Racer (Evolved) — Swordcraft follower, 4/3. 兵士・超克.
// Storm.
// On Evolve - {[cost03]}: Give this follower {[attack]}+1/{[defense]}+1 for every other follower on
// your field.
import { defineCard, onEvolve } from "../helpers";
import { playPointsCost } from "../costs";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    onEvolve({
      cost: playPointsCost(3),
      *resolve(fx) {
        const x = fx.game.followers(fx.controller).filter((id) => id !== fx.self).length;
        yield* fx.giveStats(fx.self, x, x);
      },
    }),
  ],
});
