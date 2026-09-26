// BP20-043 Raio, Elimination Manifest (Evolved) — 9/9.
// On Evolve - Deal each enemy follower on the field 9 damage. Put 2 Ersatz Elimination tokens into your EX area. They cost
// 1 less to play this turn.
import { defineCard, onEvolve } from "../helpers";
import { ERSATZ_ELIMINATION } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const enemies = fx.game.followers(fx.game.opponent(fx.controller));
        if (enemies.length > 0) yield* fx.dealDamageEach(enemies, 9);
        for (const id of yield* fx.tokensToEx([ERSATZ_ELIMINATION, ERSATZ_ELIMINATION])) yield* fx.changePlayCost(id, -1, "endOfTurn");
      },
    }),
  ],
});
