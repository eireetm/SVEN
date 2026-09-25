// BP01-053 Merlin (Evolved) — 4/3.
// On Evolve: Select a spell that costs 3 play points or less in your cemetery and play it for
// 0 play points. (The played spell is in the resolution zone, so it does not count for its own
// Spellchain; afterwards it goes to the cemetery — rulings.)
// A spell that can't be played (e.g. no target for it) can still be selected; then nothing happens
// (the same ruling on BP07-020 / 053 / 108, CR 1.3.2).
import { defineCard, onEvolve } from "../helpers";
import { and, costAtMost, inYourZone, isSpell } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [inYourZone("cemetery", { filter: and(isSpell, costAtMost(3)) })],
      *resolve(fx) {
        const card = fx.targets[0]![0]!;
        if (fx.game.card(card)?.zone === "cemetery" && fx.game.canPlay(card, fx.controller, { cost: 0 })) {
          yield* fx.playCard(card, { cost: 0 });
        }
      },
    }),
  ],
});
