// BP01-053 Merlin (Evolved) — 4/3.
// On Evolve: Select a spell that costs 3 play points or less in your cemetery and play it for
// 0 play points. (The played spell is in the resolution zone, so it does not count for its own
// Spellchain; afterwards it goes to the cemetery — rulings.)
// Only spells that could actually be played are selectable (illegal plays are never offered).
import { defineCard, onEvolve } from "../helpers";
import { and, costAtMost, inYourZone, isSpell } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [
        inYourZone("cemetery", {
          filter: (g, id) => and(isSpell, costAtMost(3))(g, id) && g.canPlay(id, g.controller(id), { cost: 0 }),
        }),
      ],
      *resolve(fx) {
        yield* fx.playCard(fx.targets[0]![0]!, { cost: 0 });
      },
    }),
  ],
});
