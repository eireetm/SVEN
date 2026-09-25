// BP07-040 Eleanor, Cosmic Flower (Evolved) — 3/3.
// On Evolve - Search your deck for a Splendid Conjury, put it into your EX area, then shuffle your
// deck. Spellchain (10): It costs 2 less to play this turn. (Spellchain is fixed when the effect
// starts resolving, CR 13.3.1.4.)
import { defineCard, onEvolve } from "../helpers";
import { named } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const chain = fx.game.spellchain(fx.controller, 10);
        const found = yield* fx.search((id) => named("Splendid Conjury")(fx.game, id), { to: "ex" });
        if (!chain) return;
        for (const id of found) if (fx.game.card(id)?.zone === "ex") yield* fx.changePlayCost(id, -2, "endOfTurn");
      },
    }),
  ],
});
