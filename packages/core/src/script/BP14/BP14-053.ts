// BP14-053 Si Long, Draconic God-Queen — Dragoncraft follower, 3, 3/3. 宴楽・ドラゴニュート.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Put a Tidal Tyranny token into your EX area. If Overflow is active for you, give your leader
// {[defense]}+2.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Tidal Tyranny"]);
        if (fx.game.overflow(fx.controller)) yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
