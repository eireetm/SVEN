// BP20-088 Ephemeral Demon Princess (Evolved) — 4/4.
// On Evolve - Select up to 2 Yokai cards that cost a total of 4 or less in your cemetery and put them into your EX area. They
// cost 0 to play this turn. (元のコスト.)
import { defineCard, onEvolve, selectWithinTotalCost } from "../helpers";
import { yokai } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const candidates = fx.game.cards(fx.controller, "cemetery").filter((id) => yokai(fx.game, id));
        const chosen = yield* selectWithinTotalCost(fx, candidates, 4, 2);
        for (const id of yield* fx.putIntoEx(chosen)) yield* fx.setPlayCost(id, 0, "endOfTurn");
      },
    }),
  ],
});
