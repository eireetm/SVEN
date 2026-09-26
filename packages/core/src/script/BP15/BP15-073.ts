// BP15-073 Beginner Dragoon — Dragoncraft follower, 2, 2/3. 竜使い.
// {[fanfare]} Put a Dragon token into your EX area. If Overflow is active for you, it costs 2 less to play this
// turn.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const tokens = yield* fx.tokensToEx(["Dragon"]);
        if (!fx.game.overflow(fx.controller)) return;
        for (const id of tokens) yield* fx.changePlayCost(id, -2, "endOfTurn");
      },
    }),
  ],
});
