// BP13-038 Ghios, Sparkling Prism (Evolved) — Runecraft follower, 5/5. 魔法使い.
// On Evolve - Select up to X Mage spells with different names that cost 3 or less in your cemetery and put
// them into your EX area. X equals the number of mana counters on this card. The selected spells cost 3
// less to play this turn. Remove all mana counters from this card. (元のコスト; picked one at a time, each
// time only names not picked yet.)
import type { CardId } from "../../model/ids";
import { defineCard, onEvolve } from "../helpers";
import { and, costAtMost, isSpell } from "../targets";
import { mage } from "./shared";

const cheapMageSpell = and(isSpell, mage, costAtMost(3));

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const x = fx.game.counters(fx.self, "mana");
        const nameOf = (id: CardId) => fx.game.db.get(fx.game.card(id)!.def).name;
        const chosen: CardId[] = [];
        while (chosen.length < x) {
          const names = chosen.map(nameOf);
          const options = fx.game.cards(fx.controller, "cemetery").filter((id) => cheapMageSpell(fx.game, id) && !names.includes(nameOf(id)));
          const [pick] = yield* fx.selectCards(options, 0, 1);
          if (pick === undefined) break;
          chosen.push(pick);
        }
        for (const id of yield* fx.putIntoEx(chosen)) yield* fx.changePlayCost(id, -3, "endOfTurn");
        if (x > 0 && fx.game.card(fx.self)?.zone === "field") yield* fx.removeCounters(fx.self, "mana", x);
      },
    }),
  ],
});
