// BP05-036 Raio, Omen of Truth (Evolved) — Runecraft follower, 9/9. 絶傑・魔法使い.
// On Evolve: Look at the top 9 cards of your deck. You may put up to 3 cards that cost 3 play
// points or less from among them into your EX area. They cost 3 less to play this turn. Put the
// remaining cards on the bottom of your deck in any order. (元のコスト: printed cost.)
import { defineCard, onEvolve } from "../helpers";
import { costAtMost } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const top = fx.topCards(9);
        const cheap = top.filter((id) => costAtMost(3)(fx.game, id));
        const chosen = yield* fx.selectCards(cheap, 0, 3, fx.controller, top);
        for (const id of yield* fx.putIntoEx(chosen)) yield* fx.changePlayCost(id, -3, "endOfTurn");
        yield* fx.bottomInAnyOrder(top.filter((id) => fx.game.card(id)?.zone === "deck"));
      },
    }),
  ],
});
