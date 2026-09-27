// CP02-054 Yui Ohtsuki (Evolved) — 5/5.
// On Evolve - Search your deck for a spell that costs 3 or less or amulet that costs 3 or less, put it into your EX area, then
// shuffle your deck. It costs 3 less to play this turn. (元のコスト.)
import { defineCard, onEvolve } from "../helpers";
import { costAtMost, isAmulet, isSpell } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const g = fx.game;
        const found = yield* fx.search((id) => (isSpell(g, id) || isAmulet(g, id)) && costAtMost(3)(g, id), { to: "ex" });
        for (const id of found) yield* fx.changePlayCost(id, -3, "endOfTurn");
      },
    }),
  ],
});
