// BP21-106 Aqua Priestess — Havencraft follower, 7, 4/5. 信仰.
// Ward.
// {[fanfare]} Search your deck for a spell that costs 5 or less, put it into your EX area, then shuffle. It costs 5 less to
// play this turn. (元のコスト; CR 10.4.4.1.)
import { defineCard, fanfare } from "../helpers";
import { costAtMost, isSpell } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        const found = yield* fx.search((id) => isSpell(fx.game, id) && costAtMost(5)(fx.game, id), { to: "ex" });
        for (const id of found) if (fx.game.card(id)?.zone === "ex") yield* fx.changePlayCost(id, -5, "endOfTurn");
      },
    }),
  ],
});
