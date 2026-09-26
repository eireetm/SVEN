// BP13-086 Ghastly Banishment — Abysscraft spell, 1. 死者.
// Put 2 Ghost tokens into your EX area. They cost 1 less to play this turn. (CR 10.4.4.1)
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        for (const id of yield* fx.tokensToEx(["Ghost", "Ghost"])) yield* fx.changePlayCost(id, -1, "endOfTurn");
      },
    }),
  ],
});
