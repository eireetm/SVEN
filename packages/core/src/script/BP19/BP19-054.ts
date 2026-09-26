// BP19-054 Feline Magic — Runecraft spell, 1. 魔法使い・魔法生物.
// Search your deck for an Electrokitty, put it into your EX area, then shuffle. Spellchain (7) - It costs 1 less to play this
// turn. (Spellchain is fixed as the effect starts resolving, CR 13.3.1.4.)
import { defineCard, spell } from "../helpers";
import { named } from "../targets";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const chain = fx.game.spellchain(fx.controller, 7);
        const found = yield* fx.search((id) => named("Electrokitty")(fx.game, id), { to: "ex" });
        if (!chain) return;
        for (const id of found) if (fx.game.card(id)?.zone === "ex") yield* fx.changePlayCost(id, -1, "endOfTurn");
      },
    }),
  ],
});
