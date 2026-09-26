// BP14-043 Orchestral Mage — Runecraft follower, 3, 3/3. 宴楽・魔法使い・禁忌.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} If you've played another Festive card this turn, give this Storm or Drain. (This card, if it
// was played, is not "another".)
import type { Keyword } from "../../model/keyword";
import { defineCard, enteredByAbility, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        const festive = g.cardsPlayedThisTurn(fx.controller).filter((def) => g.db.get(def).traits.includes("宴楽")).length;
        if (festive - (enteredByAbility(fx) ? 0 : 1) < 1 || g.card(fx.self)?.zone !== "field") return;
        const [keyword] = yield* fx.choose([
          { id: "storm", label: "Storm" },
          { id: "drain", label: "Drain" },
        ]);
        yield* fx.giveKeyword(fx.self, keyword as Keyword);
      },
    }),
  ],
});
